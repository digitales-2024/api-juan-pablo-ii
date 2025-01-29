import { ApiProperty } from '@nestjs/swagger';

export class Event {
  @ApiProperty()
  id: string;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  type: EventType;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ required: false })
  permissionType?: PermissionType;

  @ApiProperty({ required: false })
  permissionStatus?: PermissionStatus;

  @ApiProperty({ required: false })
  duration?: number;

  @ApiProperty({ required: false })
  patientId?: string;

  @ApiProperty({ required: false })
  staffId?: string;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  recurrenceId?: string;
}

export enum EventType {
  CITA_MEDICA = 'CITA_MEDICA',
  CONTROL_MEDICO = 'CONTROL_MEDICO',
  INGRESO = 'INGRESO',
  SALIDA = 'SALIDA',
  ALMUERZO = 'ALMUERZO',
  DESCANSO = 'DESCANSO',
  PERMISO = 'PERMISO',
  TURNO = 'TURNO',
}

export enum PermissionType {
  MEDICO = 'MEDICO',
  PERSONAL = 'PERSONAL',
  VACACIONES = 'VACACIONES',
}

export enum PermissionStatus {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}
