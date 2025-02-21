import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
export class PrescriptionItemResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  description?: string;
}

export class Prescription {
  @ApiProperty()
  id: string;

  @ApiProperty()
  updateHistoryId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  registrationDate: string;

  @ApiProperty({
    type: [PrescriptionItemResponse],
  })
  prescriptionMedicaments: PrescriptionItemResponse[];

  @ApiProperty({
    type: [PrescriptionItemResponse],
  })
  prescriptionServices: PrescriptionItemResponse[];

  @ApiProperty()
  description?: string;

  @ApiProperty()
  purchaseOrderId?: string;

  @ApiProperty()
  isActive: boolean;
}
