import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsObject, ValidateNested, IsISO8601 } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DayOfWeek } from '@prisma/client';
import { RecurrenceDto } from './create-staff-schedule.dto';

/**
 * DTO para actualizar un horario del personal.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export class UpdateStaffScheduleDto {
  @ApiProperty({
    description: 'ID del personal al que pertenece el horario',
    example: 'user-1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  staffId?: string;

  @ApiProperty({
    description: 'ID de la sucursal a la que pertenece el horario',
    example: 'branch-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  branchId?: string;

  @ApiProperty({
    description: 'Título del horario',
    example: 'Turno Mañana',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiProperty({
    description: 'Color del horario',
    example: 'sky',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  color?: string;

  @ApiProperty({
    description: 'Hora de inicio en formato HH:mm',
    example: '08:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  startTime?: string;

  @ApiProperty({
    description: 'Hora de fin en formato HH:mm',
    example: '17:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  endTime?: string;

  @ApiProperty({
    description: 'Días de la semana en los que es válido el horario',
    enum: DayOfWeek,
    isArray: true,
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek?: DayOfWeek[];

  @ApiProperty({
    description: 'Configuración de recurrencia para el horario',
    type: RecurrenceDto,
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto;

  @ApiProperty({
    description: 'Fechas excluidas en formato YYYY-MM-DD',
    example: ['2024-05-01'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsISO8601({ strict: false }, { each: true })
  exceptions?: string[];
} 