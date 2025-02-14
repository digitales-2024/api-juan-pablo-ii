import { PartialType, PickType } from '@nestjs/swagger';
import { CreateStaffScheduleDto } from './create-staff-schedule.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar un horario del personal.
 * Extiende de CreateStaffScheduleDto de forma parcial.
 */
export class UpdateStaffScheduleDto extends PartialType(
  PickType(CreateStaffScheduleDto, [
    'color',
    'staffId',
    'branchId',
    'startTime',
    'endTime',
    'daysOfWeek',
    'recurrence',
    'exceptions'
  ] as const)
) {
  @ApiProperty({
    description: 'Título del horario (requerido)',
    example: 'Turno Mañana',
    required: true
  })
  title!: string; // Campo obligatorio
} 