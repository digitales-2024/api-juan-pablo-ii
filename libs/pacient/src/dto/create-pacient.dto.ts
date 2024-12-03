import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsEmail,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePacienteDto {
  @ApiProperty({
    description: 'Nombre completo del paciente',
    example: 'Juan Pérez',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  nombre: string;

  @ApiProperty({
    description: 'Apellido del paciente',
    example: 'González',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  apellido?: string;

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
  @IsDateString()
  cumpleanos: Date;

  @ApiProperty({
    description: 'Sexo del paciente (M/F)',
    example: true,
    required: true,
  })
  @IsBoolean()
  sexo: boolean;

  @ApiProperty({
    description: 'Dirección del paciente',
    example: 'Av. Principal 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  direccion?: string;

  @ApiProperty({
    description: 'Número de teléfono del paciente',
    example: '+51999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(15)
  @Transform(({ value }) => value?.trim())
  telefono?: string;

  @ApiProperty({
    description: 'Correo electrónico del paciente',
    example: 'juan.perez@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  correo?: string;

  @ApiProperty({
    description: 'Fecha de registro del paciente',
    example: '2023-01-01',
    required: true,
  })
  @IsDateString()
  fechaRegistro: Date;

  @ApiProperty({
    description: 'Alergias conocidas del paciente',
    example: 'Polen, Maní',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  alergias?: string;

  @ApiProperty({
    description: 'Medicamentos que el paciente está tomando',
    example: 'Ibuprofeno, Paracetamol',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  medicamentosActuales?: string;

  @ApiProperty({
    description: 'Nombre del contacto de emergencia',
    example: 'María Pérez',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  contactoEmergencia?: string;

  @ApiProperty({
    description: 'Teléfono del contacto de emergencia',
    example: '+51999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(15)
  @Transform(({ value }) => value?.trim())
  telefonoEmergencia?: string;

  @ApiProperty({
    description: 'Nombre de la compañía de seguro médico',
    example: 'Seguro Salud',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  seguroMedico?: string;

  @ApiProperty({
    description: 'Estado civil del paciente',
    example: 'Soltero',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  estadoCivil?: string;

  @ApiProperty({
    description: 'Profesión del paciente',
    example: 'Ingeniero',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  ocupacion?: string;

  @ApiProperty({
    description: 'Nombre y dirección del lugar de trabajo',
    example: 'Empresa XYZ, Av. Industrial 456',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  lugarTrabajo?: string;

  @ApiProperty({
    description: 'Grupo sanguíneo del paciente',
    example: 'O+',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  @Transform(({ value }) => value?.trim())
  tipoSangre?: string;

  @ApiProperty({
    description: 'Enfermedades hereditarias en la familia',
    example: 'Diabetes, Hipertensión',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  antecedentesFamiliares?: string;

  @ApiProperty({
    description: 'Hábitos como consumo de tabaco, alcohol, etc.',
    example: 'Fuma, Bebe ocasionalmente',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  habitosVida?: string;

  @ApiProperty({
    description: 'Registro de vacunas recibidas',
    example: 'COVID-19, Influenza',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  vacunas: string;

  @ApiProperty({
    description: 'Nombre y contacto del médico principal',
    example: 'Dr. Juan Pérez, +51999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  medicoCabecera?: string;

  @ApiProperty({
    description: 'Idioma preferido del paciente',
    example: 'Español',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  idioma?: string;

  @ApiProperty({
    description: 'Consentimientos y autorizaciones firmadas',
    example: 'Consentimiento informado firmado el 01/01/2023',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  autorizacionTratamiento?: string;

  @ApiProperty({
    description: 'Cualquier otra observación relevante',
    example: 'Paciente con antecedentes de alergias severas',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  observaciones?: string;

  @ApiProperty({
    description: 'Imagen del paciente para identificación visual',
    example: 'data:image/png;base64,...',
    required: false,
  })
  @IsString()
  @IsOptional()
  fotografiaPaciente?: string;
}
