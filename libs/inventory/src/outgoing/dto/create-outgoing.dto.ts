import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOutgoingDto {
  @ApiProperty({
    description: 'Nombre de la salida',
    example: 'Salida de medicamentos',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'Descripción de la salida',
    example: 'Descripción opcional de la salida',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'ID del almacén',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  storageId: string;

  @ApiProperty({
    description: 'Fecha de la salida',
    example: '2023-10-01T00:00:00.000Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'Indica si es un traslado entre almacenes',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isTransference?: boolean;

  @ApiProperty({
    description: 'Estado de la salida',
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
  @IsUUID()
  @IsOptional()
  referenceId?: string;
}
