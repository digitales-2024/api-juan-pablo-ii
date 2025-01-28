import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsDate,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { RecurrenceFrequency, DayOfWeek } from '../entities/recurrence.entity';

export class CreateRecurrenceDto {
  @ApiProperty({
    description: 'Frecuencia de la recurrencia',
    example: 'DIARIA',
    required: true,
  })
  @IsEnum(RecurrenceFrequency)
  @IsOptional()
  frequency: RecurrenceFrequency;

  @ApiProperty({
    description: 'Intervalo de repetición',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsOptional()
  interval: number;

  @ApiProperty({
    description: 'Días específicos de la semana (opcional)',
    example: ['LUNES', 'MIERCOLES', 'VIERNES'],
    required: false,
  })
  @IsEnum(DayOfWeek, { each: true })
  @IsArray()
  @IsOptional()
  daysOfWeek?: DayOfWeek[];

  @ApiProperty({
    description: 'Fechas específicas a excluir',
    example: ['SABADO', 'DOMINGO'],
    required: false,
  })
  @IsEnum(DayOfWeek, { each: true })
  @IsArray()
  @IsOptional()
  exceptions?: DayOfWeek[];

  @ApiProperty({
    description: 'Fecha de inicio de la recurrencia',
    example: '2024-03-15T00:00:00Z',
    required: true,
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin de la recurrencia',
    example: '2024-12-31T00:00:00Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate?: Date;

  @ApiProperty({
    description: 'Indica si la recurrencia está activa',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
