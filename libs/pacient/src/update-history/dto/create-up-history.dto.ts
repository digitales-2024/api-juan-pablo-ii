// create-up-history.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUpHistoryDto {
  @ApiProperty({
    description: 'ID de la consulta médica',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  consultaMedicaId: string;

  @ApiProperty({
    description: 'ID del personal médico',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  personalId: string;

  @ApiProperty({
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  sucursalId: string;

  @ApiProperty({
    description: 'ID de la historia médica',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  historiaMedicaId: string;

  @ApiProperty({
    description: 'Indica si tiene receta médica',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  receta?: boolean = false;

  @ApiProperty({
    description: 'ID de la receta médica',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  recetaMedicaId?: string;

  @ApiProperty({
    description: 'Fecha de la actualización',
    example: '2024-03-15T10:00:00Z',
    required: true,
  })
  @IsDateString()
  fecha: Date;

  @ApiProperty({
    description: 'Detalles de la actualización',
    example: {
      diagnostico: 'Gripe común',
      tratamiento: 'Reposo y medicamentos',
      observaciones: 'Seguimiento en 7 días',
    },
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  updateHistoria: any;

  @ApiProperty({
    description: 'Descripción adicional',
    example: 'Paciente presenta mejoría',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Indica si requiere descanso médico',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  descansoMedico?: boolean = false;

  @ApiProperty({
    description: 'Descripción del descanso médico',
    example: 'Reposo por 3 días',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  descripDescanso?: string;
}
