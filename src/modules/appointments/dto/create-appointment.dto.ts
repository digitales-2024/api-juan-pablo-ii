import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID del personal médico',
    example: 'd424bee1-2574-439e-8db5-eaee510239e1',
  })
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({
    description: 'ID del servicio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    description: 'ID de la sucursal',
    example: '38371f66-63ca-4bb1-ac31-d2b165f6514d',
  })
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio de la cita',
    example: '2024-12-25T14:30:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({
    description: 'Fecha y hora de fin de la cita',
    example: '2024-12-25T15:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  end: string;

  @ApiProperty({
    description: 'Tipo de cita',
    enum: AppointmentType,
    example: 'CONSULTA',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: AppointmentType;

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'El paciente tiene alergia a la penicilina',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @ApiProperty({
    description: 'Estado de la cita',
    enum: AppointmentStatus,
    example: 'PENDING',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Motivo de cancelación (si aplica)',
    example: 'Paciente canceló',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  cancellationReason?: string;

  @ApiProperty({
    description: 'ID de la cita original (si es reprogramación)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  rescheduledFromId?: string;


}
