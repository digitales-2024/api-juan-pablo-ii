import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIncomingDto {
  @ApiProperty({
    description: 'Nombre del ingreso',
    example:
      'Ingreso de medicamentos, Compra, transferencia, regulacion de stock, etc.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'Descripción del ingreso',
    example: 'Descripción opcional del ingreso',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'ID del almacén al que va ser ingresado',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  storageId: string;

  @ApiProperty({
    description: 'Fecha del ingreso',
    example: '2023-10-01T00:00:00.000Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'Estado del ingreso',
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  state: boolean;

  @ApiProperty({
    description: 'ID de referencia',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  referenceId?: string;
}
