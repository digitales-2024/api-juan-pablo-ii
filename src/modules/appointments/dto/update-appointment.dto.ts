import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { AppointmentStatus, AppointmentType } from '@prisma/client';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  staffId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  serviceId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  start?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  end?: string;

  @ApiProperty({ enum: AppointmentStatus, required: false })
  @IsString()
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({ enum: AppointmentType, required: false })
  @IsString()
  @IsOptional()
  type?: AppointmentType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  cancellationReason?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  rescheduledFromId?: string;

  @ApiProperty({ required: false, description: 'ID del evento asociado en el calendario' })
  @IsString()
  @IsOptional()
  eventId?: string;
}
