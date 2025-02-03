import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../entities/event-type.enum';

/**
 * DTO para la creación de eventos
 * @class CreateEventDto
 */
export class CreateEventDto {
  @ApiProperty({
    description: 'Título del evento',
    example: 'Turno Mañana',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Tipo de evento',
    enum: ['TURNO', 'CITA', 'OTRO'],
    example: 'TURNO',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  type: EventType;

  @ApiProperty({
    description: 'Fecha y hora de inicio del evento',
    example: '2023-11-15T08:00:00Z',
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  start: Date;

  @ApiProperty({
    description: 'Fecha y hora de fin del evento',
    example: '2023-11-15T11:00:00Z',
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  end: Date;

  @ApiProperty({
    description: 'Motivo de cancelación (opcional)',
    example: 'Vacaciones',
    required: false,
  })
  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @ApiProperty({
    description: 'ID del horario del personal (opcional)',
    example: 'uuid-del-horario',
    required: false,
  })
  @IsString()
  @IsOptional()
  staffScheduleId?: string;

  @ApiProperty({
    description: 'ID del personal asociado',
    example: 'uuid-del-personal',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({
    description: 'ID de la sucursal asociada',
    example: 'uuid-de-la-sucursal',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  branchId: string;
}