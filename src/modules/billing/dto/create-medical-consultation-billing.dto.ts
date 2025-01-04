import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsString,
  IsObject,
} from 'class-validator';
import { PaymentMethod } from '@pay/pay/interfaces/payment.types';

export class CreateMedicalConsultationBillingDto {
  @ApiProperty({
    description: 'ID de la consulta médica',
    example: '29c5e5b8-1835-42f9-ae34-217a3791ba22',
  })
  @IsUUID()
  consultaId: string;

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
    description: 'Moneda de la transacción',
    default: 'PEN',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

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
      additionalNotes: 'Paciente requiere atención especial',
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
