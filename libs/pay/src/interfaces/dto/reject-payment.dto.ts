import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RejectPaymentDto {
  @ApiProperty({
    description: 'Motivo del rechazo',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
