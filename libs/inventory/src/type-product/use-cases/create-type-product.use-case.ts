import { Injectable } from '@nestjs/common';
import { CreateTypeProductDto } from '../dto/create-type-product.dto';
import { TypeProduct } from '../entities/type-product.entity';
import { TypeProductRepository } from '../repositories/type-product.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateTypeProductUseCase {
  constructor(
    private readonly typeProductRepository: TypeProductRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createTypeProductDto: CreateTypeProductDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeProduct>> {
    const newTypeProduct = await this.typeProductRepository.transaction(
      async () => {
        // Create type product
        const typeProduct = await this.typeProductRepository.create({
          name: createTypeProductDto.name,
          description: createTypeProductDto.description,
          isActive: true,
        });

        // Register audit
        await this.auditService.create({
          entityId: typeProduct.id,
          entityType: 'tipoProducto',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return typeProduct;
      },
    );

    return {
      success: true,
      message: 'Tipo de producto creado exitosamente',
      data: newTypeProduct,
    };
  }
}
