import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
export class PrescriptionItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  description?: string;
}

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
    example: '2024-03-15',
    required: true,
  })
  @IsDateString()
  registrationDate: string;

  @ApiProperty({
    type: [PrescriptionItemDto],
    description: 'Detalle de medicamentos y dosificación',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Paracetamol',
        cantidad: '1',
        description: 'recomendado para el paciente',
      },
    ],
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  @IsNotEmpty()
  prescriptionMedicaments?: PrescriptionItemDto[];

  @ApiProperty({
    type: [PrescriptionItemDto],
    description: 'Detalle de medicamentos y dosificación',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'consulta general',
        cantidad: '1',
        description: 'recomendado para el paciente',
      },
    ],
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  @IsNotEmpty()
  prescriptionServices?: PrescriptionItemDto[];

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
