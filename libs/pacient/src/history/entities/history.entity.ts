import { ApiProperty } from '@nestjs/swagger';

export class MedicalHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  medicalHistory: any;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  isActive: boolean;
}
