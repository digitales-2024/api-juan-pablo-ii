import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsJSON,
} from 'class-validator';
import { OrderStatus, OrderType } from '../../order.types';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Código de la orden (opcional)',
    example: 'ORD-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Tipo de orden',
    example: OrderType.PRODUCT_SALE_ORDER,
    required: true,
    enum: OrderType,
  })
  @IsNotEmpty()
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({
    description: 'ID del tipo de movimiento',
    example: 'movement-type-uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  movementTypeId: string;

  @ApiProperty({
    description: 'ID de referencia',
    example: 'reference-uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  referenceId: string;

  @ApiProperty({
    description: 'ID de origen (opcional)',
    example: 'source-uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiProperty({
    description: 'ID de destino (opcional)',
    example: 'target-uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiProperty({
    description: 'Estado de la orden',
    example: OrderStatus.DRAFT,
    required: true,
    enum: OrderStatus,
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Moneda de la orden',
    example: 'USD',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Subtotal de la orden',
    example: 100.5,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  subtotal: number;

  @ApiProperty({
    description: 'Impuesto',
    example: 18.5,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  tax: number;

  @ApiProperty({
    description: 'Total de la orden',
    example: 119.0,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Notas adicionales (opcional)',
    example: 'Orden de prueba',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Metadatos adicionales (opcional)',
    example: { custom: 'value' },
    required: false,
  })
  @IsOptional()
  @IsJSON()
  metadata?: string;
}
