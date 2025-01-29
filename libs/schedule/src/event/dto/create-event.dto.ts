import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsInt,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  EventType,
  PermissionType,
  PermissionStatus,
} from '../entities/event.entity';

export class CreateEventDto {
  @ApiProperty({
    description: 'ID del calendario al que pertenece el evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  calendarId: string;

  @ApiProperty({
    description: 'Tipo de evento',
    example: 'INGRESO',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  type: EventType;

  @ApiProperty({
    description: 'Nombre del evento',
    example: 'Ingreso turno mañana',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del evento',
    example: 'Ingreso del personal para el turno de la mañana',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio del evento',
    example: '2024-03-15T08:00:00',
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    description: 'Fecha y hora de fin del evento',
    example: '2024-03-15T17:00:00',
    required: true,
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiProperty({
    description: 'Color para identificar visualmente el evento',
    example: '#FF0000',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  color?: string;

  @ApiProperty({
    description: 'Tipo de permiso (si aplica)',
    example: 'MEDICO',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  permissionType?: PermissionType;

  @ApiProperty({
    description: 'Estado del permiso',
    example: 'PENDIENTE',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  permissionStatus?: PermissionStatus;

  @ApiProperty({
    description: 'Duración del evento en minutos',
    example: 60,
    required: false,
  })
  @IsInt()
  @IsOptional()
  duration?: number;

  @ApiProperty({
    description: 'ID del paciente asociado al evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiProperty({
    description: 'ID del personal asociado al evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  staffId?: string;

  @ApiProperty({
    description: 'ID del personal asociado al evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  recurrenceId?: string;

  @ApiProperty({
    description: 'Indica si el evento está activo',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
