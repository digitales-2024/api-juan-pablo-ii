import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID del tipo de cita médica',
    example: '38371f66-63ca-4bb1-ac31-d2b165f6514d',
  })
  @IsString()
  @IsNotEmpty()
  tipoCitaMedicaId: string;

  @ApiProperty({
    description: 'ID del personal médico',
    example: 'd424bee1-2574-439e-8db5-eaee510239e1',
  })
  @IsString()
  @IsNotEmpty()
  personalId: string;

  @ApiProperty({
    description: 'ID de la consulta médica',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  consultaId: string;

  @ApiProperty({
    description: 'Fecha y hora de la cita',
    example: '2024-12-25T14:30:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Descripción o motivo de la cita',
    example: 'Control mensual',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  description: string;
}
