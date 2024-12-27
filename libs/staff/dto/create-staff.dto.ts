import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    description: 'ID de la especialidad del personal médico',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  especialidadId: string;

  @ApiProperty({
    description: 'ID del usuario asociado al personal médico en el sistema',
    example: '7c4dd6ce-scratch-41d4-a716-446655441111',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Nombre del personal médico',
    example: 'Carlos',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Apellido del personal médico',
    example: 'Rodríguez',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  lastName: string;

  @ApiProperty({
    description: 'Número de DNI del personal médico',
    example: '40506070',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  dni: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del personal médico',
    example: '1980-05-15',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  birth: string;

  @ApiProperty({
    description: 'email',
    example: 'personal1@correo.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  email: string;

  @ApiProperty({
    description: 'numero de telefono',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  phone?: string;
}
