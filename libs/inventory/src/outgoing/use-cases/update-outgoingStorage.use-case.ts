import { Injectable } from '@nestjs/common';
import { DetailedOutgoing } from '../entities/outgoing.entity';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import {
  CreateMovementUseCase,
  UpdateMovementUseCase,
} from '@inventory/inventory/movement/use-cases';
import { MovementRepository } from '@inventory/inventory/movement/repositories/movement.repository';
import { StockRepository } from '@inventory/inventory/stock/repositories/stock.repository';
import { UpdateStockUseCase } from '@inventory/inventory/stock/use-cases/update-stock.use-case';
import { UpdateOutgoingStorageDto } from '../dto/update-outgoingStorage.dto';

export type StockAction = {
  type: 'increase' | 'decrease' | 'adjust';
  quantity: number;
};

@Injectable()
export class UpdateOutgoingStorageUseCase {
  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly auditService: AuditService,
    private readonly updateMovementUseCase: UpdateMovementUseCase,
    private readonly createMovementUseCase: CreateMovementUseCase,
    private readonly movementRepository: MovementRepository,
    private readonly stockRepository: StockRepository,
    private readonly updateStockUseCase: UpdateStockUseCase,
  ) {}

  async execute(
    id: string,
    updateOutgoingStorageDto: UpdateOutgoingStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedOutgoing>> {
    const updatedOutgoing = await this.outgoingRepository.transaction(
      async () => {
        try {
          const outgoing = await this.outgoingRepository.update(id, {
            name: updateOutgoingStorageDto.name,
            description: updateOutgoingStorageDto.description,
            storageId: updateOutgoingStorageDto.storageId,
            state: updateOutgoingStorageDto.state,
            referenceId: updateOutgoingStorageDto.referenceId,
            date: updateOutgoingStorageDto.date,
          });

          const movements = updateOutgoingStorageDto.movement;
          const originalMovements = await this.movementRepository.findMany({
            where: { outgoingId: outgoing.id },
          });

          const newMovements = movements.filter(
            (m) => !m.id || m.id.length === 0,
          );
          const remainingMovements = movements.filter(
            (m) => m.id && m.id.length > 0,
          );
          const movementsToDelete = originalMovements.filter(
            (om) => !remainingMovements.find((rm) => rm.id === om.id),
          );

          // Handle remaining movements
          for (const movement of remainingMovements) {
            const currentStock = await this.getCurrentStock({
              productId: movement.productId,
              storageId: outgoing.storageId,
            });

            await this.updateMovementUseCase.execute(
              movement.id,
              {
                buyingPrice: movement.buyingPrice,
                date: movement.date,
                productId: movement.productId,
                outgoingId: outgoing.id,
                quantity: movement.quantity,
                state: movement.state,
              },
              user,
            );

            const originalQuantity = originalMovements.find(
              (m) => m.id === movement.id,
            ).quantity;
            await this.arbitrarilyUpdateStock({
              currentStock,
              user,
              action: {
                type: 'adjust',
                quantity: movement.quantity - originalQuantity,
              },
              data: {
                storageId: outgoing.storageId,
                productId: movement.productId,
                price: movement.buyingPrice,
              },
            });
          }

          // Handle new movements
          for (const movement of newMovements) {
            const currentStock = await this.getCurrentStock({
              productId: movement.productId,
              storageId: outgoing.storageId,
            });

            await this.createMovementUseCase.execute(
              {
                buyingPrice: movement.buyingPrice,
                date: movement.date,
                productId: movement.productId,
                outgoingId: outgoing.id,
                quantity: movement.quantity,
                state: movement.state,
              },
              user,
            );

            await this.arbitrarilyUpdateStock({
              currentStock,
              user,
              action: {
                type: 'decrease',
                quantity: movement.quantity,
              },
              data: {
                storageId: outgoing.storageId,
                productId: movement.productId,
                price: movement.buyingPrice,
              },
            });
          }

          // Handle deleted movements
          for (const movement of movementsToDelete) {
            const currentStock = await this.getCurrentStock({
              productId: movement.productId,
              storageId: outgoing.storageId,
            });

            await this.movementRepository.delete(movement.id);
            await this.arbitrarilyUpdateStock({
              currentStock,
              user,
              action: {
                type: 'increase',
                quantity: movement.quantity,
              },
              data: {
                storageId: outgoing.storageId,
                productId: movement.productId,
                price: movement.buyingPrice,
              },
            });
          }

          await this.auditService.create({
            entityId: outgoing.id,
            entityType: 'salida',
            action: AuditActionType.UPDATE,
            performedById: user.id,
            createdAt: new Date(),
          });

          return await this.outgoingRepository.findDetailedOutgoingById(
            outgoing.id,
          );
        } catch (error) {
          throw new Error(`Error al actualizar salida: ${error.message}`);
        }
      },
    );

    return {
      success: true,
      message: 'Salida actualizada exitosamente',
      data: updatedOutgoing,
    };
  }

  // Add the helper methods
  async getCurrentStock({
    storageId,
    productId,
  }: {
    storageId: string;
    productId: string;
  }) {
    const currentStock = await this.stockRepository.getStockByStorageAndProduct(
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
    action: StockAction;
    currentStock: {
      stock: number;
      id: string;
    };
    user: UserData;
  }) {
    const actionType = {
      increase: 'increase',
      decrease: 'decrease',
      adjust: 'adjust',
    };

    let newStock: number = currentStock.stock;
    switch (action.type) {
      case actionType.increase:
        newStock += action.quantity;
        break;
      case actionType.decrease:
        newStock -= action.quantity;
        break;
      case actionType.adjust:
        newStock += action.quantity * -1;
        break;
      default:
        throw new Error(`Tipo de acción no soportado: ${action.type}`);
    }

    return await this.updateStockUseCase.execute(
      currentStock.id,
      {
        storageId: data.storageId,
        productId: data.productId,
        stock: newStock,
        price: data.price,
      },
      user,
    );
  }
}
