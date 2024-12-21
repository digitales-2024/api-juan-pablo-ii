import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para los items de una orden de compra
 * @class
 */
export class ProductPurchaseItemDto {
  @ApiProperty({
    description: 'ID del producto a comprar',
    example: 'ece57703-3246-4c2d-8f82-825cd239237a',
    required: true,
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Cantidad de unidades a comprar del producto',
    example: 100,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario de compra al proveedor',
    example: 2.5,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

/**
 * DTO para la creación de órdenes de compra de productos
 * Incluye validaciones y documentación para Swagger
 * @class
 */
export class CreateProductPurchaseBillingDto {
  @ApiProperty({
    description: 'Lista de productos a comprar con sus cantidades y precios',
    type: [ProductPurchaseItemDto],
    example: [
      {
        productId: 'ece57703-3246-4c2d-8f82-825cd239237a',
        quantity: 100,
        unitPrice: 2.5,
      },
      {
        productId: 'de6639ac-7373-4612-8196-f4eb8374b7a6',
        quantity: 50,
        unitPrice: 3.75,
      },
    ],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPurchaseItemDto)
  products: ProductPurchaseItemDto[];

  @ApiProperty({
    description: 'ID del tipo de movimiento para la entrada de productos',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  movementTypeId: string;

  @ApiProperty({
    description: 'ID del proveedor que suministra los productos',
    example: '7c0e8500-f29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  supplierId: string;

  @ApiProperty({
    description: 'Moneda en la que se realiza la compra',
    example: 'PEN',
    default: 'PEN',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Notas o comentarios adicionales sobre la orden de compra',
    example: 'Compra mensual de medicamentos esenciales',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Metadata adicional para la orden de compra',
    example: {
      purchaseOrderNumber: 'PO-2024-001',
      deliveryInstructions: 'Entregar en almacén principal',
      contactPerson: 'Juan Pérez',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
