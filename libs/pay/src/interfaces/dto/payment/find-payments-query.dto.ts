import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus, PaymentType } from '../../payment.types';

export class FindPaymentsQueryDto {
  @ApiProperty({
    enum: PaymentStatus,
    description: 'Estado del pago',
    required: true,
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({
    enum: PaymentType,
    description: 'Tipo de pago',
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;
}
