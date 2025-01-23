import { Injectable } from '@nestjs/common';
import { UpdateTypeProductDto } from '../dto/update-type-product.dto';
import { TypeProduct } from '../entities/type-product.entity';
import { TypeProductRepository } from '../repositories/type-product.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
@Injectable()
export class UpdateTypeProductUseCase {
  constructor(
    private readonly typeProductRepository: TypeProductRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateTypeProductDto: UpdateTypeProductDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeProduct>> {
    const updatedTypeProduct = await this.typeProductRepository.transaction(
      async () => {
        // Update type product
        const typeProduct = await this.typeProductRepository.update(id, {
          name: updateTypeProductDto.name,
          description: updateTypeProductDto.description,
        });

        // Register audit
        await this.auditService.create({
          entityId: typeProduct.id,
          entityType: 'tipoProducto',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return typeProduct;
      },
    );

    return {
      success: true,
      message: 'Tipo de producto actualizado exitosamente',
      data: updatedTypeProduct,
    };
  }
}
