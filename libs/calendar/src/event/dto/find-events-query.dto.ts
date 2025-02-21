import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, Matches } from 'class-validator';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO para filtrar eventos, por ejemplo por staffId, tipo, sucursal y estado.
 */
export class FindEventsQueryDto {
  @ApiPropertyOptional({
    description: 'ID del personal para filtrar eventos',
    example: 'uuid-del-personal',
  })
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiPropertyOptional({
    description: 'Tipo de evento (TURNO, CITA, OTRO)',
    enum: EventType,
    example: EventType.TURNO,
  })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional({
    description: 'ID de la sucursal para filtrar eventos',
    example: 'uuid-de-la-sucursal',
  })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({
    description:
      'Estado del evento (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)',
    enum: EventStatus,
    example: 'CONFIRMED',
  })
  @IsOptional()
  @IsString()
  status?: EventStatus;

  @ApiPropertyOptional({
    description: 'ID del horario del personal para filtrar eventos',
    example: 'uuid-del-horario-del-personal',
  })
  @IsOptional()
  @IsString()
  staffScheduleId?: string;

  @ApiPropertyOptional({
    description: 'Fecha inicial (YYYY-MM-DD)',
    example: '2025-02-18',
    type: String,
  })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'startDate debe ser formato YYYY-MM-DD (ej: 2025-02-18)',
  })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha final (YYYY-MM-DD)',
    example: '2025-02-28',
    type: String,
  })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'endDate debe ser formato YYYY-MM-DD (ej: 2025-02-28)',
  })
  @IsOptional()
  endDate?: string;
}
