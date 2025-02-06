import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Nombre completo del paciente',
    example: 'Juan Pérez',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  name: string;

  @ApiProperty({
    description: 'Apellido del paciente',
    example: 'González',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @ApiProperty({
    description: 'DNI del paciente',
    example: '12345678',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value.trim())
  dni: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del paciente',
    example: '1990-01-01',
    required: true,
  })
  @IsString()
  birthDate: string;

  @ApiProperty({
    description: 'Sexo del paciente (M/F)',
    example: 'Masculino Femenino',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    description: 'Dirección del paciente',
    example: 'Av. Principal 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiProperty({
    description: 'Número de teléfono del paciente',
    example: '+51999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(15)
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiProperty({
    description: 'Correo electrónico del paciente',
    example: 'juan.perez@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  email?: string;

  @ApiProperty({
    description: 'Nombre del contacto de emergencia',
    example: 'María Pérez',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  emergencyContact?: string;

  @ApiProperty({
    description: 'Teléfono del contacto de emergencia',
    example: '+51999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(15)
  @Transform(({ value }) => value?.trim())
  emergencyPhone?: string;

  @ApiProperty({
    description: 'Nombre de la compañía de seguro médico',
    example: 'Seguro Salud',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  healthInsurance?: string;

  @ApiProperty({
    description: 'Estado civil del paciente',
    example: 'Soltero',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  maritalStatus?: string;

  @ApiProperty({
    description: 'Profesión del paciente',
    example: 'Ingeniero',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  occupation?: string;

  @ApiProperty({
    description: 'Nombre y dirección del lugar de trabajo',
    example: 'Empresa XYZ, Av. Industrial 456',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  workplace?: string;

  @ApiProperty({
    description: 'Grupo sanguíneo del paciente',
    example: 'O+',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  @Transform(({ value }) => value?.trim())
  bloodType?: string;

  @ApiProperty({
    description: 'Nombre y contacto del médico principal',
    example: 'Dr. Juan Pérez, +51999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  primaryDoctor?: string;

  @ApiProperty({
    description: 'Idioma preferido del paciente',
    example: 'Español',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  language?: string;

  @ApiProperty({
    description: 'Cualquier otra observación relevante',
    example: 'Paciente con antecedentes de alergias severas',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @ApiProperty({
    description: 'Imagen del paciente para identificación visual',
    example: null,
    required: false,
  })
  @IsString()
  @IsOptional()
  patientPhoto?: string = null;
}
