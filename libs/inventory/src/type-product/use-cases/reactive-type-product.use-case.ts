import { Injectable } from '@nestjs/common';
import { TypeProductRepository } from '../repositories/type-product.repository';
import { TypeProduct } from '../entities/type-product.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
@Injectable()
export class ReactivateTypeProductUseCase {
  constructor(
    private readonly typeProductRepository: TypeProductRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<TypeProduct[]>> {
    // Reactivar los tipos de productos y registrar auditoría
    const reactivatedTypeProducts =
      await this.typeProductRepository.transaction(async () => {
        const typeProducts =
          await this.typeProductRepository.reactivateMany(ids);

        // Registrar auditoría para cada tipo de producto reactivado
        await Promise.all(
          typeProducts.map((typeProduct) =>
            this.auditService.create({
              entityId: typeProduct.id,
              entityType: 'tipoProducto',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return typeProducts;
      });

    return {
      success: true,
      message: 'Tipos de productos reactivados exitosamente',
      data: reactivatedTypeProducts,
    };
  }
}
