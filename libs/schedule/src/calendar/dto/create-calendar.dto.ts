import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { CalendarType } from '../entities/calendar.entity';
import { Transform } from 'class-transformer';

export class CreateCalendarDto {
  @ApiProperty({
    description: 'Nombre del calendario',
    example: 'Horario Normal',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tipo de calendario',
    example: 'PERSONAL, CITAS_MEDICAS o CONSULTAS_MEDICAS',
  })
  @ApiProperty({
    description: 'Tipo de calendario',
    example: 'PERSONAL',
  })
  @IsEnum(CalendarType, {
    message:
      "type must be either 'PERSONAL', 'CITAS_MEDICAS' or 'CONSULTAS_MEDICAS'",
  })
  @Transform(({ value }) => value.toUpperCase())
  type: CalendarType;

  @ApiProperty({
    description: 'ID de la cita médica asociada al calendario',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  medicalAppointmentId?: string;

  @ApiProperty({
    description: 'ID de la consulta médica asociada al calendario',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  medicalConsultationId?: string;

  @ApiProperty({
    description: 'ID del personal asociado al calendario',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  staffId?: string;

  @ApiProperty({
    description: 'ID de la sucursal asociada al calendario',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  branchId?: string;

  @ApiProperty({
    description: 'Indica si el calendario está activo',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
