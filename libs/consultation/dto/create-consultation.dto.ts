import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConsultationDto {
  @ApiProperty({
    description: 'ID del Servicio',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  serviceId: string;

  @ApiProperty({
    description: 'ID del Paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  pacienteId: string;

  @ApiProperty({
    description: 'ID del Sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  sucursalId: string;

  @ApiProperty({
    description: 'Descripción de la consulta',
    example: 'Consulta médica para cirugía... etc',
    required: true,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  descripcion: string;

  @ApiProperty({
    description: 'Fecha de la consulta',
    example: '2023-10-01T10:00:00Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;
}
