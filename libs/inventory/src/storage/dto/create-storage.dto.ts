import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStorageDto {
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
}
