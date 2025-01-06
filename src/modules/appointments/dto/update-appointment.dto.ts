import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tipoCitaMedicaId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  personalId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  consultaId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
