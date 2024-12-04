import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAppointmentTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de cita',
    example: 'Consulta General',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase())
  name: string;

  @ApiProperty({
    description: 'Descripción del tipo de cita',
    example: 'Consulta médica general de rutina',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  description?: string;
}
