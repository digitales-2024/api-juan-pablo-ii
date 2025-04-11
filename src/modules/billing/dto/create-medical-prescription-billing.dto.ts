import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsObject,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@pay/pay/interfaces/payment.types';

export class PrescriptionProductItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'ID del almacen',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  storageId: string;
}

export class CreateMedicalPrescriptionBillingDto {
  @ApiProperty({
    description: 'Array de IDs de citas médicas',
    example: ['29c5e5b8-1835-42f9-ae34-217a3791ba22', '39c5e5b8-1835-42f9-ae34-217a3791ba33'],
    type: [String],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  appointmentIds: string[];

  @ApiProperty({
    description: 'Lista de productos a vender',
    type: [PrescriptionProductItemDto],
    example: [
      {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
        storageId: 'd4892502-5685-45e1-b323-55f933f54387',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionProductItemDto)
  products: PrescriptionProductItemDto[];

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  patientId: string;


  @ApiProperty({
    description: 'ID de la receta',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  recipeId: string;



  @ApiProperty({
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  branchId: string;

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
    description: 'Número de Comprobante o referencia del pago',
    required: false,
  })
  @IsString()
  @IsOptional()
  voucherNumber?: string;

  @ApiProperty({
    description: 'Notas adicionales sobre la receta',
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
      additionalNotes: 'Instrucciones especiales',
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
