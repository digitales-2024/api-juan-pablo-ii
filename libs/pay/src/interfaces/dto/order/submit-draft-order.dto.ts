import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SubmitDraftOrderDto {
  @ApiProperty({
    description: 'Notas adicionales sobre la confirmación del borrador',
    required: false,
    example: 'Orden confirmada para procesamiento',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
