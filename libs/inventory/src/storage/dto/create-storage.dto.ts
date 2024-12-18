import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStorageDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @ApiProperty({
    description: 'Nombre del almacén',
    example: 'Almacén Central, Almacén 1, Alacen 2',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Ubicación física del almacén',
    example: 'alacen 1, piso 2, pasillo 3',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  location?: string;

  @ApiProperty({
    description: 'ID del tipo de almacenamiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  typeStorageId: string;

  @ApiProperty({
    description: 'Stock disponible en este almacén',
    example: 100.0,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
