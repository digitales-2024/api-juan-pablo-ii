import { ApiProperty } from '@nestjs/swagger';
import { EventType, EventStatus } from '@prisma/client';

/**
 * Entidad que representa un evento en el calendario
 * @class Event
 */
export class Event {
  @ApiProperty({
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    description: 'ID único del evento'
  })
  id: string;

  @ApiProperty({
    example: 'Reunión de equipo',
    description: 'Título del evento'
  })
  title: string;

  @ApiProperty({ 
    enum: EventType,
    example: EventType.TURNO,
    description: 'Tipo de evento (TURNO, CITA, OTRO)' 
  })
  type: EventType;

  @ApiProperty({
    example: '2024-05-20T09:00:00Z',
    description: 'Fecha y hora de inicio del evento'
  })
  start: Date;

  @ApiProperty({
    example: '2024-05-20T10:00:00Z',
    description: 'Fecha y hora de fin del evento'
  })
  end: Date;

  @ApiProperty({ 
    required: false,
    example: '#FF5733',
    description: 'Color del evento en formato hexadecimal' 
  })
  color?: string;

  @ApiProperty({
    enum: EventStatus,
    example: EventStatus.CONFIRMED,
    description: 'Estado del evento (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)',
    nullable: true
  })
  status?: EventStatus;

  @ApiProperty({
    example: false,
    description: 'Indica si el evento está activo'
  })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si el evento está cancelado'
  })
  isCancelled: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica si es un evento base',
    required: false
  })
  isBaseEvent?: boolean;

  @ApiProperty({
    type: 'object',
    required: false,
    example: { frequency: 'WEEKLY', interval: 1, until: '2024-12-31' },
    description: 'Configuración de recurrencia del evento'
  })
  recurrence?: any;

  @ApiProperty({
    type: [Date],
    required: false,
    description: 'Fechas excluidas de la recurrencia'
  })
  exceptionDates?: Date[];

  @ApiProperty({
    required: false,
    description: 'Razón de la cancelación del evento'
  })
  cancellationReason?: string;

  @ApiProperty({
    required: false,
    description: 'ID del horario del personal asociado'
  })
  staffScheduleId?: string;

  @ApiProperty({
    description: 'ID del personal asociado al evento'
  })
  staffId: string;

  @ApiProperty({
    description: 'ID de la sucursal donde ocurre el evento'
  })
  branchId: string;

  @ApiProperty({
    description: 'Fecha de creación del evento'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del evento'
  })
  updatedAt: Date;

  @ApiProperty({ 
    type: 'object',
    description: 'Información del personal asociado',
    required: false 
  })
  staff?: {
    name: string;
    lastName: string;
  };

  @ApiProperty({ 
    type: 'object',
    description: 'Información de la sucursal',
    required: false 
  })
  branch?: {
    name: string;
  };
}

