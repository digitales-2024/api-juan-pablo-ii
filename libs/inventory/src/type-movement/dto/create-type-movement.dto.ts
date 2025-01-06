import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTypeMovementDto {
  @ApiProperty({
    description: 'ID opcional de la orden',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description:
      'ID opcional de referencia si fuera necesario de otra interaccion con  tipo de movimiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({
    description:
      'Nombre del tipo de movimiento este referencia aun ID opcional',
    example: 'Venta, Compra, Devolución',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'Descripción del tipo de movimiento',
    example: 'Descripción opcional del tipo de movimiento',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description:
      'Estado del tipo de movimiento booleano true = activo, false = inactivo',
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  state: boolean;

  @ApiProperty({
    description:
      'Identifica si es un "Ingreso" o "Salida" el campo es bolleano por defecto es null true=Ingreso, false=Salida',
    example: null,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isIncoming: boolean;

  @ApiProperty({
    description: 'Tipo externo del movimiento',
    example: 'Venta, Compra, Devolución',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  tipoExterno?: string;
}
