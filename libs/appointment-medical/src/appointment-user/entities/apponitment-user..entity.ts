import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
export class AppointmentMedicalResponse {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  id: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  staffId?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  userId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  medicalHistoryId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  patientId?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  status?: string;
}

export class AppointmentResponse {
  id: string;
  staff: string;
  service: string;
  branch: string;
  patient: string;
  start: Date;
  end: Date;
  status: string;
  medicalHistoryId: string;
}
