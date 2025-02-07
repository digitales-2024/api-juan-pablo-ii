import { ApiProperty } from '@nestjs/swagger';

export class UpdateHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  medicalHistoryId: string;

  @ApiProperty()
  prescription: boolean;

  @ApiProperty()
  prescriptionId?: string;

  @ApiProperty()
  updateHistory: any;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  medicalLeave: boolean;

  @ApiProperty()
  medicalLeaveStartDate?: Date;

  @ApiProperty()
  medicalLeaveEndDate?: Date;

  @ApiProperty()
  medicalLeaveDays?: number;

  @ApiProperty()
  leaveDescription?: string;

  @ApiProperty()
  isActive: boolean;
}
