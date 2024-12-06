// create-history.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHistoryDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  pacienteId: string;

  @ApiProperty({
    description: 'Datos de la historia médica',
    example: {
      antecedentes: 'Sin antecedentes relevantes',
      alergias: 'Ninguna conocida',
      enfermedadesCronicas: ['Hipertensión'],
      cirugiasPrevias: ['Apendicectomía 2018'],
    },
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  historiaMedica: string;

  @ApiProperty({
    description: 'Fecha de la historia médica',
    example: '2024-03-15T10:00:00Z',
    required: true,
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    description: 'Descripción adicional',
    example: 'Primera consulta del paciente',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
