import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class MedicalHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  @IsOptional()
  medicalHistory?: any;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  isActive: boolean;
}
