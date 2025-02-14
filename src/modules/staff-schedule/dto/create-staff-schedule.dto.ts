import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsObject,
  ValidateNested,
  IsPositive,
  IsISO8601,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DayOfWeek } from '@prisma/client';

class RecurrenceDto {
  @ApiProperty({
    description: 'Frecuencia de recurrencia',
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
    example: 'WEEKLY'
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @ApiProperty({
    description: 'Intervalo de repetición',
    example: 1,
    minimum: 1
  })
  @IsInt()
  @IsPositive()
  interval: number;

  @ApiProperty({
    description: 'Fecha límite de recurrencia en formato YYYY-MM-DD',
    example: '2024-12-31'
  })
  @IsISO8601({ strict: false })
  until: string;
}

export class CreateStaffScheduleDto {
  @ApiProperty({
    description: 'ID del personal al que pertenece el horario',
    example: 'user-1234',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  staffId: string;

  @ApiProperty({
    description: 'ID de la sucursal a la que pertenece el horario',
    example: 'branch-5678',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  branchId: string;

  @ApiProperty({
    description: 'Título del horario',
    example: 'Turno Mañana',
    default: 'Turno',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty({
    description: 'Color del horario',
    example: 'sky',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  color: string;

  @ApiProperty({
    description: 'Hora de inicio en formato HH:mm',
    example: '08:00',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  startTime: string;

  @ApiProperty({
    description: 'Hora de fin en formato HH:mm',
    example: '17:00',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  endTime: string;

  @ApiProperty({
    description: 'Días de la semana en los que es válido el horario',
    enum: DayOfWeek,
    isArray: true,
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek: DayOfWeek[];

  @ApiProperty({
    description: 'Configuración de recurrencia para el horario',
    type: RecurrenceDto,
    required: true,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence: RecurrenceDto;

  @ApiProperty({
    description: 'Fechas excluidas en formato YYYY-MM-DD',
    example: ['2024-05-01'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsISO8601({ strict: false }, { each: true })
  exceptions: string[];
}