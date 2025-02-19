import { Injectable } from '@nestjs/common';
import { IncomingRepository } from '../repositories/incoming.repository';
import { DetailedIncoming } from '../entities/incoming.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteIncomingDto } from '../dto/delete-incoming.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { StockRepository } from '@inventory/inventory/stock/repositories/stock.repository';
import { UpdateStockUseCase } from '@inventory/inventory/stock/use-cases/update-stock.use-case';

@Injectable()
export class DeleteIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
    private readonly stockRepository: StockRepository,
    private readonly updateStockUseCase: UpdateStockUseCase,
  ) {}

  async execute(
    deleteIncomingDto: DeleteIncomingDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming[]>> {
    try {
      const deletedIncomings = await this.incomingRepository.transaction(
        async () => {
          try {
            // Realiza el soft delete y obtiene los ingresos actualizados
            const incomings = await this.incomingRepository.softDeleteMany(
              deleteIncomingDto.ids,
            );

            const detailedModifiedIncomings =
              await this.incomingRepository.findManyDetailedIncomingById(
                deleteIncomingDto.ids,
              );

            // Stock updates
            for (const incoming of detailedModifiedIncomings) {
              for (const movement of incoming.Movement) {
                const currentStock =
                  await this.stockRepository.getStockByStorageAndProduct(
                    incoming.Storage.id,
                    movement.Producto.id,
                  );

                if (!currentStock) {
                  throw new Error(
                    `Stock no encontrado para producto ${movement.Producto.id} en almacén ${incoming.Storage.id}`,
                  );
                }

                const newStockQuantity = currentStock.stock - movement.quantity;

                //Validation negatives allowed
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
                    price: movement?.buyingPrice ?? movement?.Producto.precio,
                    //updatedAt: new Date(),
                  },
                  user,
                );
              }
            }

            // Create audit logs
            await Promise.all(
              incomings.map((incoming) =>
                this.auditService.create({
                  entityId: incoming.id,
                  entityType: 'ingreso',
                  action: AuditActionType.DELETE,
                  performedById: user.id,
                  createdAt: new Date(),
                }),
              ),
            );

            return await this.incomingRepository.getAllDetailedIncoming();
          } catch (error) {
            // This will trigger a rollback
            throw new Error(`Transaction failed: ${error.message}`);
          }
        },
      );

      return {
        success: true,
        message: 'Ingresos eliminados exitosamente',
        data: deletedIncomings,
      };
    } catch (error) {
      throw new Error(`Error al eliminar ingresos: ${error.message}`);
    }
  }
}
