import { Injectable } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Stock } from '../entities/stock.entity';
import { CreateStockDto } from '../dto';
import { StockRepository } from '../repositories/stock.repository';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateStockUseCase {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createStockDto: CreateStockDto,
    user: UserData,
  ): Promise<BaseApiResponse<Stock>> {
    const newStock = await this.stockRepository.transaction(async () => {
      // Create storage
      const storage = await this.stockRepository.create({
        storageId: createStockDto.storageId,
        productId: createStockDto.productId,
        stock: createStockDto.stock,
        price: createStockDto.price,
      });

      // Register audit
      await this.auditService.create({
        entityId: storage.id,
        entityType: 'stock',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return storage;
    });

    return {
      success: true,
      message: 'stock Agregado exitosamente',
      data: newStock,
    };
  }
}
