import { HttpStatus, Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../entities/product.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Product[]>> {
    // Reactivar los productos y registrar auditoría
    const reactivatedProducts = await this.productRepository.transaction(
      async () => {
        const products = await this.productRepository.reactivateMany(ids);

        // Registrar auditoría para cada producto reactivado
        await Promise.all(
          products.map((product) =>
            this.auditService.create({
              entityId: product.id,
              entityType: 'producto',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return products;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Productos reactivados exitosamente',
      data: reactivatedProducts,
    };
  }
}
