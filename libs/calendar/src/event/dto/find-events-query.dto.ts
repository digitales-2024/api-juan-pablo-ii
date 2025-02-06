import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '../entities/event.entity';

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
    description: 'Estado del evento (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)',
    enum: EventStatus,
    example: 'CONFIRMED',
  })
  @IsOptional()
  @IsString()
  status?: EventStatus;
}