import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus, AppointmentType, PaymentMethod } from '@prisma/client';

export class Appointment {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId?: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  start: Date;

  @ApiProperty()
  end: Date;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiProperty({ enum: AppointmentType })
  type: AppointmentType;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  cancellationReason?: string;

  @ApiProperty()
  noShowReason?: string;

  @ApiProperty()
  rescheduledFromId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({
    description: 'Motivo de la reprogramación',
    required: false,
  })
  rescheduleReason?: string;

  // Campos de auditoría
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relaciones
  @ApiProperty({ required: false })
  staff?: any;

  @ApiProperty({ required: false })
  service?: any;

  @ApiProperty({ required: false })
  branch?: any;

  @ApiProperty({ required: false })
  patient?: any;

  @ApiProperty({ required: false })
  event?: any;
}
