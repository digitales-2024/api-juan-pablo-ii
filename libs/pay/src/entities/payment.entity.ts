// libs/pay/src/entities/payment.entity.ts

import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../interfaces/payment.types';

export class Payment {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty()
  amount: number;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @ApiProperty({ required: false })
  voucherNumber?: string;

  @ApiProperty({ required: false })
  verifiedBy?: string;

  @ApiProperty({ required: false })
  verifiedAt?: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
