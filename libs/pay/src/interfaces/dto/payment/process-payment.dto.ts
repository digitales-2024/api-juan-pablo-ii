// libs/pay/src/interfaces/dto/process-payment.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../payment.types';

export class ProcessPaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    description: 'Método de pago a utilizar',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Monto del pago',
    example: 100.5,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Número de comprobante/operación',
    required: false,
  })
  @IsString()
  @IsOptional()
  voucherNumber?: string;

  @ApiProperty({
    description: 'Fecha de pago',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Descripción o comentarios adicionales',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
