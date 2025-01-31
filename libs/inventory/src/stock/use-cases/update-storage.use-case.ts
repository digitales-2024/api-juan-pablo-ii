import { Injectable } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Stock } from '../entities/stock.entity';
import { UpdateStockDto } from '../dto';
import { StockRepository } from '../repositories/stock.repository';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateStockUseCase {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateStockDto: UpdateStockDto,
    user: UserData,
  ): Promise<BaseApiResponse<Stock>> {
    const updatedStock = await this.stockRepository.transaction(async () => {
      // Update product
      const stock = await this.stockRepository.update(id, {
        storageId: updateStockDto.storageId,
        productId: updateStockDto.productId,
        stock: updateStockDto.stock,
        price: updateStockDto.price,
      });

      // Register audit
      await this.auditService.create({
        entityId: stock.id,
        entityType: 'stock',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return stock;
    });

    return {
      success: true,
      message: 'stock actualizado exitosamente',
      data: updatedStock,
    };
  }
}
