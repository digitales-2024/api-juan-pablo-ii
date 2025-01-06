import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsEnum,
  Min,
  IsOptional,
} from 'class-validator';
import { PaymentMethod } from '../../payment.types';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Monto a reembolsar',
    example: 100.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Razón del reembolso',
    example: 'Producto defectuoso',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Método de reembolso',
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  @IsEnum(PaymentMethod)
  refundMethod: PaymentMethod;

  @ApiProperty({
    description: 'Notas adicionales',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
