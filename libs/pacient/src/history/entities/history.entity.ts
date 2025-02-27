import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class MedicalHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  @IsOptional()
  medicalHistory?: Record<string, string>;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  isActive: boolean;
}

export class UpdateHistoryImage {
  @ApiProperty()
  id: string;
  @ApiProperty()
  url: string;
}

export class UpdateHistoryData {
  @ApiProperty()
  branch: string;
  @ApiProperty()
  service: string;
  @ApiProperty()
  staff: string;

  @ApiProperty({
    type: [UpdateHistoryImage],
    required: false,
  })
  images?: UpdateHistoryImage[];
}

export class UpdateHistoryResponse extends MedicalHistory {
  @ApiProperty({
    type: [UpdateHistoryData],
    required: false,
  })
  @IsOptional()
  updates?: UpdateHistoryData[];
}
