// dto/create-recipe.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRecipeDto {
  @ApiProperty({
    description: 'ID de la actualización de historia médica',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  updateHistoriaId: string;

  @ApiProperty({
    description: 'ID de la sucursal donde se emite la receta',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  sucursalId: string;

  @ApiProperty({
    description: 'ID del personal médico que emite la receta',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  personalId: string;

  @ApiProperty({
    description: 'ID del paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  pacienteId: string;

  @ApiProperty({
    description: 'Fecha de emisión de la receta',
    example: '2024-03-15T10:00:00Z',
    required: true,
  })
  @IsDateString()
  fechaRegistro: Date;

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
  receta: any;

  @ApiProperty({
    description: 'Descripción o notas adicionales',
    example: 'Tomar después de las comidas',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiProperty({
    description: 'ID de la orden de compra asociada',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  ordenCompraId?: string;
}
