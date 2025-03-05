import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsString,
  IsObject,
  IsNumber,
} from 'class-validator';
import { PaymentMethod } from '@pay/pay/interfaces/payment.types';

export class CreateMedicalAppointmentBillingDto {
  @ApiProperty({
    description: 'ID de la consulta médica',
    example: '29c5e5b8-1835-42f9-ae34-217a3791ba22',
  })
  @IsUUID()
  appointmentId: string;

  @ApiProperty({
    description: 'Método de pago a utilizar',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Monto pagado',
    example: 150.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @ApiProperty({
    description: 'Moneda utilizada para el pago',
    default: 'PEN',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Número de voucher o referencia del pago',
    required: false,
  })
  @IsString()
  @IsOptional()
  voucherNumber?: string;

  @ApiProperty({
    description: 'Notas adicionales sobre la consulta',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Metadata adicional para la orden',
    required: false,
    type: 'object',
    example: {
      additionalNotes: 'Social no pagante',
      preferences: {
        language: 'español',
        communicationMethod: 'email',
      },
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
