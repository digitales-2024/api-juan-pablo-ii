import { Injectable } from '@nestjs/common';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { DetailedOutgoing } from '../entities/outgoing.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteOutgoingDto } from '../dto/delete-outgoing.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { StockRepository } from '@inventory/inventory/stock/repositories/stock.repository';
import { UpdateStockUseCase } from '@inventory/inventory/stock/use-cases/update-stock.use-case';

@Injectable()
export class DeleteOutgoingUseCase {
  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly auditService: AuditService,
    private readonly stockRepository: StockRepository,
    private readonly updateStockUseCase: UpdateStockUseCase,
  ) {}

  async execute(
    deleteOutgoingDto: DeleteOutgoingDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedOutgoing[]>> {
    try {
      const deletedOutgoings = await this.outgoingRepository.transaction(
        async () => {
          try {
            // Realiza el soft delete y obtiene las salidas actualizadas
            const outgoings = await this.outgoingRepository.softDeleteMany(
              deleteOutgoingDto.ids,
            );

            const detailedModifiedOutgoings =
              await this.outgoingRepository.findManyDetailedOutgoingById(
                deleteOutgoingDto.ids,
              );

            // Stock updates
            for (const outgoing of detailedModifiedOutgoings) {
              for (const movement of outgoing.Movement) {
                const currentStock =
                  await this.stockRepository.getStockByStorageAndProduct(
                    outgoing.Storage.id,
                    movement.Producto.id,
                  );

                if (!currentStock) {
                  throw new Error(
                    `Stock no encontrado para producto ${movement.Producto.id} en almacén ${outgoing.Storage.id}`,
                  );
                }

                const newStockQuantity = currentStock.stock + movement.quantity;

                await this.updateStockUseCase.execute(
                  currentStock.id,
                  {
                    storageId: outgoing.Storage.id,
                    productId: movement.Producto.id,
                    stock: newStockQuantity,
                    price: movement?.buyingPrice ?? movement?.Producto.precio, //Take a close look to this logic
                  },
                  user,
                );
              }
            }

            // Registra la auditoría para cada salida eliminada
            await Promise.all(
              outgoings.map((outgoing) =>
                this.auditService.create({
                  entityId: outgoing.id,
                  entityType: 'salida',
                  action: AuditActionType.DELETE,
                  performedById: user.id,
                  createdAt: new Date(),
                }),
              ),
            );

            return await this.outgoingRepository.getAllDetailedOutgoing();
          } catch (error) {
            throw new Error(`Transaction failed: ${error.message}`);
          }
        },
      );

      return {
        success: true,
        message: 'Salidas eliminadas exitosamente',
        data: deletedOutgoings,
      };
    } catch (error) {
      throw new Error(`Error al eliminar salidas: ${error.message}`);
    }
  }
}
