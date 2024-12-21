import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus, PaymentType } from '../../payment.types';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID de la orden asociada',
    example: 'order-uuid',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'Fecha del pago',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @ApiProperty({
    description: 'Estado del pago',
    example: PaymentStatus.PENDING,
    required: false,
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    description: 'Tipo de pago',
    example: PaymentType.REGULAR,
    required: true,
    enum: PaymentType,
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({
    description: 'Monto del pago',
    example: 100.5,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Descripción del pago',
    example: 'Pago de consulta médica',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Método de pago',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Número de comprobante',
    required: false,
  })
  @IsOptional()
  @IsString()
  voucherNumber?: string;

  @ApiProperty({
    description: 'ID del pago original (en caso de reembolso)',
    required: false,
  })
  @IsOptional()
  @IsString()
  originalPaymentId?: string;
}
