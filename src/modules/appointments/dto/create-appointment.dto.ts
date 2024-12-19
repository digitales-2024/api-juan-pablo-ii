import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;

  @ApiProperty({
    description: 'ID del personal médico',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  personalId: string;

  @ApiProperty({
    description: 'ID del tipo de cita',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsNotEmpty()
  tipoCitaId: string;

  @ApiProperty({
    description: 'Fecha y hora de la cita',
    example: '2024-12-25T14:30:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha: Date;

  @ApiProperty({
    description: 'Motivo de la cita',
    example: 'Control mensual',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  motivo?: string;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'Paciente requiere ayuno previo',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  observaciones?: string;
}
