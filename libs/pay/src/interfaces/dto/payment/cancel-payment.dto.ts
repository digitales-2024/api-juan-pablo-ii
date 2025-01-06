import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CancelPaymentDto {
  @ApiProperty({
    description: 'Motivo de la cancelación',
    example: 'Cliente solicitó cancelación',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cancellationReason: string;
}
