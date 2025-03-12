import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateAppointmentUserDto {
  @ApiProperty({
    description: 'Estado de la cita',
    enum: ['COMPLETED', 'NO_SHOW'],
    example: 'COMPLETED',
  })
  @IsEnum(['COMPLETED', 'NO_SHOW'], {
    message: 'El estado debe ser COMPLETED o NO_SHOW',
  })
  status: string;
}
