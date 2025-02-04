import { PartialType } from '@nestjs/swagger';
import { CreateStaffScheduleDto } from './create-staff-schedule.dto';

/**
 * DTO para actualizar un horario del personal.
 * Extiende de CreateStaffScheduleDto de forma parcial.
 */
export class UpdateStaffScheduleDto extends PartialType(CreateStaffScheduleDto) {} 