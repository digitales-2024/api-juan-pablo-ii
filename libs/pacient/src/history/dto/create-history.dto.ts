import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

// Definimos un tipo genérico que puede ser T, un arreglo de T, un string o un objeto
export type MedicalHistoryData = Record<string, string>;
export class CreateMedicalHistoryDto {
  @ApiProperty({
    description: 'ID of the patient',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Medical history data',
    example: {
      antecedentes: 'No relevant history',
      alergias: 'None known',
      enfermedadesCronicas: ['Hypertension'],
      cirugiasPrevias: ['Appendectomy 2018'],
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  medicalHistory?: MedicalHistoryData;

  @ApiProperty({
    description: 'Additional description',
    example: 'Historia medica del paciente',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
