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
  registrationDate: Date;

  @ApiProperty()
  prescription: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  purchaseOrderId?: string;

  @ApiProperty()
  isActive: boolean;
  
}
