import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../payment.types';

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
    description: 'Monto del pago',
    example: 100.5,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Estado del pago',
    example: PaymentStatus.PENDING,
    required: false,
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
  @ApiProperty({
    description: 'Fecha del pago',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date = new Date();

  @ApiProperty({
    description: 'Descripción del pago',
    example: 'Pago de orden de consulta médica',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Codigo de referencia del pago',
    example: '1111-0000-1111',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceCode?: string;
}
