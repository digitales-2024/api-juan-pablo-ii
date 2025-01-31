import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad que representa un evento en el calendario
 * @class Event
 */
export class Event {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: ['TURNO', 'CITA', 'OTRO'] })
  type: 'TURNO' | 'CITA' | 'OTRO';

  @ApiProperty()
  start: Date;

  @ApiProperty()
  end: Date;

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'], required: false })
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

  @ApiProperty()
  isCancelled: boolean;

  @ApiProperty({ required: false })
  cancellationReason?: string;

  @ApiProperty({ required: false })
  staffScheduleId?: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export enum EventStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}