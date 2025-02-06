import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidad que representa una ausencia temporal del personal
 * @class TimeOff
 */
export class TimeOff {
  @ApiProperty()
  id: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  start: Date;

  @ApiProperty()
  end: Date;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}