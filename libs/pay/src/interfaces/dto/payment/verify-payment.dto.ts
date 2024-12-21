import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Comentarios de verificación',
    required: false,
  })
  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @ApiProperty({
    description: 'Fecha de verificación',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  verifiedAt?: Date;
}
