// create-type-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTypeProductDto {
  @ApiProperty({
    description: 'Nombre del tipo de producto',
    example: 'Antibióticos, Bloqueadores solares, Gasas',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Descripción del tipo de producto',
    example: 'Medicamentos para el tratamiento de infecciones bacterianas',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
