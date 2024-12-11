import { HttpStatus, Injectable } from '@nestjs/common';
import { TypeProductRepository } from '../repositories/type-product.repository';
import { TypeProduct } from '../entities/type-product.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteTypeProductDto } from '../dto/delete-type-product.dto';

@Injectable()
export class DeleteTypeProductsUseCase {
  constructor(
    private readonly typeProductRepository: TypeProductRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteTypeProductsDto: DeleteTypeProductDto,
    user: UserData,
  ): Promise<HttpResponse<TypeProduct[]>> {
    const deletedTypeProducts = await this.typeProductRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los tipos de productos actualizados
        const typeProducts = await this.typeProductRepository.softDeleteMany(
          deleteTypeProductsDto.ids,
        );

        // Registra la auditoría para cada tipo de producto eliminado
        await Promise.all(
          typeProducts.map((typeProduct) =>
            this.auditService.create({
              entityId: typeProduct.id,
              entityType: 'tipoProducto',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return typeProducts;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tipos de productos eliminados exitosamente',
      data: deletedTypeProducts,
    };
  }
}
