import { Injectable } from '@nestjs/common';
import { DetailedIncoming } from '../entities/incoming.entity';
import { IncomingRepository } from '../repositories/incoming.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
//import { UpdateMovementDto } from '@inventory/inventory/movement/dto';
import {
  CreateMovementUseCase,
  UpdateMovementUseCase,
} from '@inventory/inventory/movement/use-cases';
import { MovementRepository } from '@inventory/inventory/movement/repositories/movement.repository';
import { StockRepository } from '@inventory/inventory/stock/repositories/stock.repository';
import { UpdateStockUseCase } from '@inventory/inventory/stock/use-cases/update-stock.use-case';
import { UpdateIncomingStorageDto } from '../dto';
import { OutgoingIncomingUpdateMovementDto } from '@inventory/inventory/movement/dto';

@Injectable()
export class UpdateIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
    private readonly updateMovementUseCase: UpdateMovementUseCase,
    private readonly createMovementUseCase: CreateMovementUseCase,
    private readonly movementRepository: MovementRepository,
    private readonly stockRepository: StockRepository,
    private readonly updateStockUseCase: UpdateStockUseCase,
  ) {}

  async execute(
    id: string,
    updateIncomingStorageDto: UpdateIncomingStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming>> {
    const updatedIncoming = await this.incomingRepository.transaction(
      async () => {
        // Update incoming
        const incoming = await this.incomingRepository.update(id, {
          name: updateIncomingStorageDto.name,
          description: updateIncomingStorageDto.description,
          storageId: updateIncomingStorageDto.storageId,
          state: updateIncomingStorageDto.state,
          referenceId: updateIncomingStorageDto.referenceId,
          date: updateIncomingStorageDto.date,
        });

        //Actaulizacion de cada movimiento
        const movements = updateIncomingStorageDto.movement;
        const originalMovements = await this.movementRepository.findMany({
          where: {
            incomingId: incoming.id,
          },
        });

        const newMovements: OutgoingIncomingUpdateMovementDto[] = [];
        const remainingMovements: OutgoingIncomingUpdateMovementDto[] = [];
        movements.forEach((m) => {
          if (m.id || m.id.length > 0) remainingMovements.push(m);
          if (!m.id || m.id.length === 0) newMovements.push(m);
        });

        const movementIds = remainingMovements
          .map((m) => m.id)
          .filter((id) => id);

        const movementsToDelete = originalMovements.filter(
          (om) => !movementIds.includes(om.id),
        );

        for (const movement of remainingMovements) {
          const currentStock = await this.getCurrentStock({
            productId: movement.productId,
            storageId: incoming.storageId,
          });
          await this.arbitrarilyUpdateStock({
            currentStock,
            action: {
              type: 'decrease',
              quantity: movement.quantity,
            },
            user,
            data: {
              storageId: incoming.storageId,
              productId: movement.productId,
              price: movement.buyingPrice,
            },
          });
          await this.updateMovementUseCase.execute(
            movement.id,
            {
              buyingPrice: movement.buyingPrice,
              date: movement.date,
              productId: movement.productId,
              incomingId: incoming.id,
              quantity: movement.quantity,
              state: movement.state,
            },
            user,
          );
        }

        for (const movement of newMovements) {
          await this.createMovementUseCase.execute(
            {
              buyingPrice: movement.buyingPrice,
              date: movement.date,
              productId: movement.productId,
              incomingId: incoming.id,
              quantity: movement.quantity,
              state: movement.state,
            },
            user,
          );
        }

        for (const movement of movementsToDelete) {
          await this.movementRepository.delete(movement.id);
        }

        // Actualización de stock

        // Register audit
        await this.auditService.create({
          entityId: incoming.id,
          entityType: 'ingreso',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return await this.incomingRepository.findDetailedIncomingById(
          incoming.id,
        );
      },
    );

    return {
      success: true,
      message: 'Ingreso actualizado exitosamente',
      data: updatedIncoming,
    };
  }

  async getCurrentStock({
    storageId,
    productId,
  }: {
    storageId: string;
    productId: string;
  }) {
    const currentStock = await this.stockRepository.getStockByStorageAndProduct(
      //   incoming.Storage.id,
      //   movement.Producto.id,
      storageId,
      productId,
    );

    if (!currentStock) {
      throw new Error(
        `Stock no encontrado para producto ${productId} en almacén ${storageId}`,
      );
    }
    return currentStock;
  }

  async arbitrarilyUpdateStock({
    currentStock,
    action,
    user,
    data,
  }: {
    data: {
      storageId: string;
      productId: string;
      price: number;
    };
    action: {
      type: 'increase' | 'decrease';
      quantity: number;
    };
    currentStock: {
      stock: number;
      id: string;
    };
    user: UserData;
  }) {
    // Increase stock
    const actionType = {
      increase: 'increase',
      decrease: 'decrease',
    };

    const newStock =
      action.type === actionType.increase
        ? currentStock.stock + action.quantity
        : currentStock.stock - action.quantity;

    const updatedStock = await this.updateStockUseCase.execute(
      currentStock.id,
      {
        storageId: data.storageId,
        productId: data.productId,
        stock: newStock,
        price: data.price,
      },
      user,
    );
    return updatedStock;
  }
}
