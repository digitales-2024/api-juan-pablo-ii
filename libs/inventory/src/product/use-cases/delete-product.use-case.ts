import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../entities/product.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteProductDto } from '../dto/delete-product.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteProductsDto: DeleteProductDto,
    user: UserData,
  ): Promise<BaseApiResponse<Product[]>> {
    const deletedProducts = await this.productRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los productos actualizados
        const products = await this.productRepository.softDeleteMany(
          deleteProductsDto.ids,
        );

        // Registra la auditoría para cada producto eliminado
        await Promise.all(
          products.map((product) =>
            this.auditService.create({
              entityId: product.id,
              entityType: 'producto',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return products;
      },
    );

    return {
      // statusCode: HttpStatus.OK,
      success: true,
      message: 'Productos eliminados exitosamente',
      data: deletedProducts,
    };
  }
}
