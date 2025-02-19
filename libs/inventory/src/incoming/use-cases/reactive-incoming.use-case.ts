import { Injectable } from '@nestjs/common';
import { IncomingRepository } from '../repositories/incoming.repository';
import { DetailedIncoming } from '../entities/incoming.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { StockRepository } from '@inventory/inventory/stock/repositories/stock.repository';
import { UpdateStockUseCase } from '@inventory/inventory/stock/use-cases/update-storage.use-case';

@Injectable()
export class ReactivateIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
    private readonly stockRepository: StockRepository,
    private readonly updateStockUseCase: UpdateStockUseCase,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming[]>> {
    try {
      const reactivatedIncomings = await this.incomingRepository.transaction(
        async () => {
          try {
            const incomings = await this.incomingRepository.reactivateMany(ids);

            const detailedModifiedIncomings =
              await this.incomingRepository.findManyDetailedIncomingById(ids);

            // Stock updates
            await Promise.all(
              detailedModifiedIncomings.flatMap((incoming) =>
                incoming.Movement.map(async (movement) => {
                  const currentStock =
                    await this.stockRepository.getStockByStorageAndProduct(
                      incoming.Storage.id,
                      movement.Producto.id,
                    );
                  if (!currentStock) {
                    throw new Error(
                      `Stock not found for product ${movement.Producto.id} in storage ${incoming.Storage.id}`,
                    );
                  }

                  const newStockQuantity =
                    currentStock.stock + movement.quantity;
                  //Consider if its necessary to calculate a total price
                  // const totalPrice =
                  //   currentStock.price +
                  //   movement.precioUnitario * movement.cantidad;

                  //Validation not necesary when reactivating
                  // if (newStockQuantity < 0) {
                  //   throw new Error(
                  //     `Insufficient stock for product ${movement.Producto.id}`,
                  //   );
                  // }

                  await this.updateStockUseCase.execute(
                    currentStock.id,
                    {
                      storageId: incoming.Storage.id,
                      productId: movement.Producto.id,
                      stock: newStockQuantity,
                      price: movement?.buyingPrice ?? movement?.Producto.precio, //Consider the if total price go here
                    },
                    user,
                  );
                }),
              ),
            );
            // Registrar auditoría para cada ingreso reactivado
            await Promise.all(
              incomings.map((incoming) =>
                this.auditService.create({
                  entityId: incoming.id,
                  entityType: 'ingreso',
                  action: AuditActionType.UPDATE,
                  performedById: user.id,
                  createdAt: new Date(),
                }),
              ),
            );

            return await this.incomingRepository.getAllDetailedIncoming();
          } catch (error) {
            // Rollback automático al detectar error
            throw new Error(`Transaction failed: ${error.message}`);
          }
        },
      );

      return {
        success: true,
        message: 'Ingresos reactivados exitosamente',
        data: reactivatedIncomings,
      };
    } catch (error) {
      // Error post-rollback
      throw new Error(`Error al reactivar ingresos: ${error.message}`);
    }
  }
}
