import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  prescriptionMedicaments: Record<string, string>;

  @ApiProperty()
  prescriptionServices: Record<string, string>;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  purchaseOrderId?: string;

  @ApiProperty()
  isActive: boolean;
}
