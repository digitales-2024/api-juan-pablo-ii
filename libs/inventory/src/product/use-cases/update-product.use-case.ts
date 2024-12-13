import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateProductDto: UpdateProductDto,
    user: UserData,
  ): Promise<HttpResponse<Product>> {
    const updatedProduct = await this.productRepository.transaction(
      async () => {
        // Update product
        const product = await this.productRepository.update(id, {
          categoriaId: updateProductDto.categoriaId,
          tipoProductoId: updateProductDto.tipoProductoId,
          name: updateProductDto.name,
          precio: updateProductDto.precio,
          unidadMedida: updateProductDto.unidadMedida,
          proveedor: updateProductDto.proveedor,
          uso: updateProductDto.uso,
          usoProducto: updateProductDto.usoProducto,
          description: updateProductDto.description,
          codigoProducto: updateProductDto.codigoProducto,
          descuento: updateProductDto.descuento,
          observaciones: updateProductDto.observaciones,
          condicionesAlmacenamiento: updateProductDto.condicionesAlmacenamiento,
          imagenUrl: updateProductDto.imagenUrl,
        });

        // Register audit
        await this.auditService.create({
          entityId: product.id,
          entityType: 'producto',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return product;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct,
    };
  }
}
