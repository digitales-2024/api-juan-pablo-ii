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
  recurrence: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    until: string;
  };

  @ApiProperty({ 
    description: 'Fechas excluidas en formato YYYY-MM-DD',
    example: ['2024-05-01']
  })
  exceptions: string[];

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
