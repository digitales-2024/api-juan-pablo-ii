// create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'ID de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  categoriaId: string;

  @ApiProperty({
    description: 'ID del tipo de producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  tipoProductoId: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Paracetamol 500mg ',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 15.5,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @ApiProperty({
    description: 'Unidad de medida',
    example: 'mg',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  unidadMedida?: string;

  @ApiProperty({
    description: 'Proveedor o fabricante',
    example: 'Laboratorios XYZ',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  proveedor?: string;

  @ApiProperty({
    description: 'Uso del producto',
    example: 'Paciente',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  uso?: string;

  @ApiProperty({
    description: 'Uso específico del producto',
    example: 'Venta',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  usoProducto?: string;

  @ApiProperty({
    description: 'Descripción del producto',
    example: 'Analgésico y antipirético para adultos',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Código único del producto',
    example: '7501234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  codigoProducto?: string;

  @ApiProperty({
    description: 'Descuento aplicado',
    example: 10.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  descuento?: number;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Mantener fuera del alcance de los niños',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  observaciones?: string;

  @ApiProperty({
    description: 'Condiciones de almacenamiento',
    example: 'Mantener en lugar fresco y seco',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  condicionesAlmacenamiento?: string;

  @ApiProperty({
    description: 'URL de la imagen del producto',
    example: 'https://ejemplo.com/imagen.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  imagenUrl?: string;
}
