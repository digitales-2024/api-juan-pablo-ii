import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createProductDto: CreateProductDto,
    user: UserData,
  ): Promise<HttpResponse<Product>> {
    const newProduct = await this.productRepository.transaction(async () => {
      // Create product
      const product = await this.productRepository.create({
        categoriaId: createProductDto.categoriaId,
        tipoProductoId: createProductDto.tipoProductoId,
        name: createProductDto.name,
        precio: createProductDto.precio,
        unidadMedida: createProductDto.unidadMedida,
        proveedor: createProductDto.proveedor,
        uso: createProductDto.uso,
        usoProducto: createProductDto.usoProducto,
        description: createProductDto.description,
        codigoProducto: createProductDto.codigoProducto,
        descuento: createProductDto.descuento,
        observaciones: createProductDto.observaciones,
        condicionesAlmacenamiento: createProductDto.condicionesAlmacenamiento,
        imagenUrl: createProductDto.imagenUrl,
      });

      // Register audit
      await this.auditService.create({
        entityId: product.id,
        entityType: 'producto',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return product;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Producto creado exitosamente',
      data: newProduct,
    };
  }
}
