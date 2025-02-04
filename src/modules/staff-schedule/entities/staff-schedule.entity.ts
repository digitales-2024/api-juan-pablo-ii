import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum para los días de la semana
 */
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

/**
 * Entidad que representa el horario del personal
 * @class StaffSchedule
 */
export class StaffSchedule {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ default: 'Turno' })
  title: string;

  @ApiProperty({ description: 'Hora de inicio en formato HH:mm' })
  startTime: string;

  @ApiProperty({ description: 'Hora de fin en formato HH:mm' })
  endTime: string;

  @ApiProperty({ enum: DayOfWeek, isArray: true })
  daysOfWeek: DayOfWeek[];

  @ApiProperty({ 
    description: 'Configuración de recurrencia',
    example: { frequency: 'WEEKLY', interval: 1, until: '2024-12-31' }
  })
  recurrence: Record<string, any>;

  @ApiProperty({ 
    description: 'Fechas excluidas del horario',
    type: [Date],
    required: false,
    default: []
  })
  exceptions: Date[];

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
