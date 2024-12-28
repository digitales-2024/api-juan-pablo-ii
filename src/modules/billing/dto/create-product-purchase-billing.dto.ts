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
import { PaymentMethod } from '@pay/pay/interfaces/payment.types';

export class ProductPurchaseItemDto {
  @ApiProperty({
    description: 'ID del producto a comprar',
    example: 'ece57703-3246-4c2d-8f82-825cd239237a',
    required: true,
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Cantidad a comprar',
    example: 10,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 100.5,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateProductPurchaseBillingDto {
  @ApiProperty({
    description: 'Lista de productos a comprar',
    type: [ProductPurchaseItemDto],
    example: [
      {
        productId: 'ece57703-3246-4c2d-8f82-825cd239237a',
        quantity: 10,
        unitPrice: 100.5,
      },
    ],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPurchaseItemDto)
  products: ProductPurchaseItemDto[];

  @ApiProperty({
    description: 'ID del almacén de destino',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  storageId: string;

  @ApiProperty({
    description: 'ID del proveedor',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  supplierId: string;

  @ApiProperty({
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Ubicación en almacén',
    example: 'Estante A-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  storageLocation?: string;

  @ApiProperty({
    description: 'Número de lote o compra',
    example: 'LOT-2024-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({
    description: 'ID de referencia externa',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({
    description: 'Moneda (default: PEN)',
    default: 'PEN',
    example: 'PEN',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Método de pago',
    default: 'CASH',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'Compra de medicamentos de inventario',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Metadata adicional',
    required: false,
    example: {
      customField: 'value',
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
