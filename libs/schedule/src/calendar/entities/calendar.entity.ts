import { ApiProperty } from '@nestjs/swagger';

export class Calendar {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: CalendarType;

  @ApiProperty({ required: false })
  medicalAppointmentId?: string;

  @ApiProperty({ required: false })
  medicalConsultationId?: string;

  @ApiProperty({ required: false })
  staffId?: string;

  @ApiProperty({ required: false })
  branchId?: string;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

export enum CalendarType {
  PERSONAL = 'PERSONAL',
  CITAS_MEDICAS = 'CITAS_MEDICAS',
  CONSULTAS_MEDICAS = 'CONSULTAS_MEDICAS',
}
