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
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@pay/pay/interfaces/payment.types';

export class ProductSaleItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'ID del almacen',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  storageId: string;


}

export class CreateProductSaleBillingDto {
  @ApiProperty({
    description: 'Lista de productos a vender',
    type: [ProductSaleItemDto],
    example: [
      {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
        storageId: 'd4892502-5685-45e1-b323-55f933f54387'

      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSaleItemDto)
  products: ProductSaleItemDto[];


  @ApiProperty({
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Ubicación en almacén',
    example: 'Estante A-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  storageLocation?: string;

  @ApiProperty({
    description: 'Número de lote',
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
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'Venta de medicamentos para paciente',
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
