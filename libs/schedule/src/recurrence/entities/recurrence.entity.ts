import { ApiProperty } from '@nestjs/swagger';

export class Recurrence {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'Frecuencia de la recurrencia',
    example: 'DIARIA',
  })
  frequency: RecurrenceFrequency;

  @ApiProperty({
    description: 'Intervalo de repetición',
    example: 1,
  })
  interval: number;

  @ApiProperty({
    description: 'Días específicos de la semana (opcional)',
    example: ['LUNES', 'MIERCOLES', 'VIERNES'],
    required: false,
  })
  daysOfWeek?: DayOfWeek[];

  @ApiProperty({
    description: 'Fechas específicas a excluir',
    example: ['SABADO', 'DOMINGO'],
    required: false,
  })
  exceptions?: DayOfWeek[];

  @ApiProperty({
    description: 'Fecha de inicio de la recurrencia',
    example: '2024-03-15T00:00:00Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin de la recurrencia',
    example: '2024-12-31T00:00:00Z',
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Indica si la recurrencia está activa',
    example: true,
    default: true,
  })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// Enums para recurrencia
export enum RecurrenceFrequency {
  DIARIA = 'DIARIA',
  SEMANAL = 'SEMANAL',
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
}

export enum DayOfWeek {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO',
}
