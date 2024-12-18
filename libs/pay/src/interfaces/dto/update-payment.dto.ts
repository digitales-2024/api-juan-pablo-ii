import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { CreatePaymentDto } from './create-payment.dto';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiProperty({
    description: 'Nuevo estado del pago',
    example: 'COMPLETED',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Nuevo monto del pago',
    example: 150.75,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({
    description: 'Nueva descripción del pago',
    example: 'Pago actualizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
