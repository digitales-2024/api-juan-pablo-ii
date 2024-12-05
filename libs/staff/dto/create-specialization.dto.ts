import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSpecializationDto {
  @ApiProperty({
    description: 'Nombre de la especialidad',
    example: 'Cardiología',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase())
  name: string;

  @ApiProperty({
    description: 'Descripción de la especialidad',
    example: 'Especialidad enfocada en el sistema cardiovascular',
    required: true,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  description?: string;
}
