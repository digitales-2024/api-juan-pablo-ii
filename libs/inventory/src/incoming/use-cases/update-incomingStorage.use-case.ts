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

export type StockAction = {
  type: 'increase' | 'decrease' | 'adjust';
  quantity: number;
};

@Injectable()
export class UpdateIncomingStorageUseCase {
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
        try {
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
            await this.arbitrarilyUpdateStock({
              currentStock,
              user,
              action: {
                type: 'adjust',
                //IMPORTANT: Here quantity act as the difference between the new stock and the current stock
                quantity:
                  movement.quantity -
                  originalMovements.find((m) => m.id === movement.id).quantity,
              },
              data: {
                storageId: incoming.storageId,
                productId: movement.productId,
                price: movement.buyingPrice,
              },
            });
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
            await this.arbitrarilyUpdateStock({
              currentStock: await this.getCurrentStock({
                productId: movement.productId,
                storageId: incoming.storageId,
              }),
              user,
              action: {
                type: 'increase',
                quantity: movement.quantity,
              },
              data: {
                storageId: incoming.storageId,
                productId: movement.productId,
                price: movement.buyingPrice, //Take a look at this
              },
            });
          }

          for (const movement of movementsToDelete) {
            await this.movementRepository.delete(movement.id);
            await this.arbitrarilyUpdateStock({
              currentStock: await this.getCurrentStock({
                productId: movement.productId,
                storageId: incoming.storageId,
              }),
              user,
              action: {
                type: 'decrease',
                quantity: movement.quantity,
              },
              data: {
                storageId: incoming.storageId,
                productId: movement.productId,
                price: movement.buyingPrice, //Take a close look to this data
              },
            });
          }

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
        } catch (error) {
          throw new Error(`Error al actualizar ingreso: ${error.message}`);
        }
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
    action: StockAction;
    // action: {
    //   type: 'increase' | 'decrease';
    //   quantity: number;
    // };
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
      adjust: 'adjust',
    };

    let newStock: number = currentStock.stock;
    switch (action.type) {
      case actionType.increase:
        // Añadir validación de stock negativo aquí
        // if (newStock < 0 && !ALLOW_NEGATIVE_STOCK) {
        //   throw new Error(
        //     `Insufficient stock for product ${params.data.productId}. ` +
        //       `Current: ${currentStock.stock}, Attempted change: ${
        //         params.action.type === 'adjust'
        //           ? params.action.difference
        //           : params.action.quantity
        //       }`,
        //   );
        // }
        newStock += action.quantity;
        break;
      case actionType.decrease:
        newStock -= action.quantity;
        break;
      case actionType.adjust:
        //Here quantity act as teh diference between the new stock and the current stock
        // Caso 1: Aumento de cantidad en movimiento
        // Original: 5 unidades → Nuevo: 8 unidades
        // Diferencia: 8 - 5 = 3
        // Impacto stock: 3 * -1 = -3 (el inventario debe reducirse en 3)

        // Caso 2: Disminución de cantidad en movimiento
        // Original: 5 unidades → Nuevo: 2 unidades
        // Diferencia: 2 - 5 = -3
        // Impacto stock: -3 * -1 = +3 (el inventario debe recuperar 3)
        newStock += action.quantity * -1;
        break;
      default:
        throw new Error(`Tipo de acción no soportado: ${action.type}`);
    }

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
