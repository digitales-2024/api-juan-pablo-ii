import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({
    description: 'ID del calendario al que pertenece el evento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  calendarioId: string;

  @ApiProperty({
    description: 'Título descriptivo del evento',
    example: 'Ingreso turno mañana',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  titulo: string;

  @ApiProperty({
    description: 'Descripción detallada del evento',
    example: 'Ingreso del personal para el turno de la mañana',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio del evento',
    example: '2024-03-15T08:00:00',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha y hora de fin del evento',
    example: '2024-03-15T17:00:00',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  fechaFin: string;

  @ApiProperty({
    description: 'Indica si el evento dura todo el día',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  todoElDia?: boolean;

  @ApiProperty({
    description: 'Tipo de evento',
    example: 'INGRESO, SALIDA, ETC',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    description: 'Color para identificar visualmente el evento',
    example: '#FF0000',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  color?: string;

  @ApiProperty({
    description: 'Indica si el evento es un permiso',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  esPermiso?: boolean;

  @ApiProperty({
    description: 'Tipo de permiso (si aplica)',
    example: 'MEDICO, PERSONAL,ETC',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  tipoPermiso?: string;

  @ApiProperty({
    description: 'Estado del permiso',
    example: 'PENDIENTE, APROBADO, RECHAZADO, ETC',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  estadoPermiso?: string;
}
