import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsDate,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductSaleItemDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateProductSaleBillingDto {
  @ApiProperty({
    description: 'Lista de productos a vender',
    type: [ProductSaleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSaleItemDto)
  products: ProductSaleItemDto[];

  @ApiProperty({ description: 'ID del tipo de movimiento' })
  @IsUUID()
  movementTypeId: string;

  @ApiProperty({ description: 'Moneda (default: PEN)', default: 'PEN' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Total preestablecido (opcional)' })
  @IsNumber()
  @IsOptional()
  total?: number;

  @ApiProperty({ description: 'Fecha de vencimiento' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @ApiProperty({ description: 'Notas adicionales' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Metadata adicional' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
