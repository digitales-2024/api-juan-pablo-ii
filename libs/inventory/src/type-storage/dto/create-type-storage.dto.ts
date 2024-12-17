import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTypeStorageDto {
  @ApiProperty({
    description: 'Nombre del tipo de almacén',
    example: 'almacen secos, almacen refrigerados',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Descripción del tipo de almacén',
    example: 'Almacén destinado a productos listos para su distribución',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'ID de la sucursal si es necesario',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiProperty({
    description: 'ID del personal responsable si es necesario',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  staffId?: string;
}
