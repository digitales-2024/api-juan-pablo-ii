import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { Transform } from 'class-transformer';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({
    description: 'Estado de la cita',
    example: 'CONFIRMADA',
    enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim().toUpperCase())
  estado?: string;
}
