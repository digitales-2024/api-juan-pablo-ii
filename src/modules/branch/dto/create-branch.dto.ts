// create-branch.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO para la creación de sucursales
 * Incluye validaciones para los campos requeridos
 *
 * @class
 */
export class CreateBranchDto {
  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sede Central',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Dirección física de la sucursal',
    example: 'Av. Principal 123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  address: string;

  @ApiProperty({
    description: 'Número de teléfono de contacto de la sucursal',
    example: '+51999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsPhoneNumber('PE')
  @Transform(({ value }) => value?.trim())
  phone?: string;
}
