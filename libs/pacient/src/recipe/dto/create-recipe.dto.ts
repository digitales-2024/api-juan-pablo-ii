import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'ID de la actualización de historia médica',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  updateHistoryId: string;

  @ApiProperty({
    description: 'ID de la sucursal donde se emite la receta',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({
    description: 'ID del personal médico que emite la receta',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Fecha de emisión de la receta',
    example: '2024-03-15T10:00:00Z',
    required: true,
  })
  @IsDateString()
  registrationDate: Date;

  @ApiProperty({
    description: 'Detalle de medicamentos y dosificación',
    example: {
      medicamentos: [
        {
          nombre: 'Paracetamol',
          dosis: '500mg',
          frecuencia: 'Cada 8 horas',
          duracion: '5 días',
        },
      ],
    },
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  prescription: any;

  @ApiProperty({
    description: 'Descripción o notas adicionales',
    example: 'Tomar después de las comidas',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'ID de la orden de compra asociada',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  purchaseOrderId?: string;
}
