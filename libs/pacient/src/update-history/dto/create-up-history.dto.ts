import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUpdateHistoryDto {
  @ApiProperty({
    description: 'ID del servicio',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    description: 'ID del personal médico',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({
    description: 'ID de la sucursal',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({
    description: 'ID de la historia médica',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  medicalHistoryId: string;

  @ApiProperty({
    description: 'Indica si tiene receta médica',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  prescription?: boolean = false;

  @ApiProperty({
    description: 'ID de la receta médica',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  prescriptionId?: string;

  @ApiProperty({
    description: 'Detalles de la actualización',
    example: {
      diagnostico: 'Gripe común',
      tratamiento: 'Reposo y medicamentos',
      observaciones: 'Seguimiento en 7 días',
    },
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  updateHistory: any;

  @ApiProperty({
    description: 'Descripción adicional',
    example: 'Paciente presenta mejoría',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Indica si requiere descanso médico',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  medicalLeave?: boolean = false;

  @ApiProperty({
    description: 'Fecha de inicio del descanso médico',
    example: '2024-03-16T10:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  medicalLeaveStartDate?: Date;

  @ApiProperty({
    description: 'Fecha de fin del descanso médico',
    example: '2024-03-19T10:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  medicalLeaveEndDate?: Date;

  @ApiProperty({
    description: 'Cantidad de días de descanso médico',
    example: 3,
    required: false,
  })
  @IsOptional()
  medicalLeaveDays?: number;

  @ApiProperty({
    description: 'Descripción del descanso médico',
    example: 'Reposo por 3 días',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  leaveDescription?: string;
}
