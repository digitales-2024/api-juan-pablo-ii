// dto/create-recurrence.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRecurrenceDto {
  @ApiProperty({
    description: 'ID del calendario al que pertenece la recurrencia',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  calendarioId: string;

  @ApiProperty({
    description: 'Frecuencia de la recurrencia',
    example: 'DIARIA',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  frecuencia: string;

  @ApiProperty({
    description: 'Intervalo de repetición',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  intervalo: number;

  @ApiProperty({
    description: 'Fecha de inicio de la recurrencia',
    example: '2024-03-15T00:00:00Z',
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha de fin de la recurrencia',
    example: '2024-12-31T00:00:00Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  fechaFin?: Date;
}
