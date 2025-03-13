import { Injectable } from '@nestjs/common';
import { StaffScheduleRepository } from '../repositories/staff-schedule.repository';
import { UpdateStaffScheduleDto } from '../dto/update-staff-schedule.dto';
import { StaffSchedule } from '../entities/staff-schedule.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { DeleteEventsByStaffScheduleUseCase } from '@calendar/calendar/event/use-cases/delete-events-by-staff-schedule.use-case';

/**
 * Caso de uso para actualizar un horario del personal.
 */
@Injectable()
export class UpdateStaffScheduleUseCase {
  constructor(
    private readonly staffScheduleRepository: StaffScheduleRepository,
    private readonly auditService: AuditService,
    private readonly deleteEventsByStaffScheduleUseCase: DeleteEventsByStaffScheduleUseCase,
  ) { }

  async execute(
    id: string,
    updateStaffScheduleDto: UpdateStaffScheduleDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule>> {
    const updatedSchedule = await this.staffScheduleRepository.transaction(async () => {
      // Primero eliminamos los eventos asociados al horario
      await this.deleteEventsByStaffScheduleUseCase.execute(id, user);

      // Actualizar el horario del personal
      const schedule = await this.staffScheduleRepository.update(id, {
        color: updateStaffScheduleDto.color,
        title: updateStaffScheduleDto.title,
        startTime: updateStaffScheduleDto.startTime,
        endTime: updateStaffScheduleDto.endTime,
        daysOfWeek: updateStaffScheduleDto.daysOfWeek,
        recurrence: updateStaffScheduleDto.recurrence,
        exceptions: updateStaffScheduleDto.exceptions,
        staffId: updateStaffScheduleDto.staffId,
        branchId: updateStaffScheduleDto.branchId,
      });

      // Registrar la auditoría de la acción
      await this.auditService.create({
        entityId: schedule.id,
        entityType: 'staff_schedule',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return schedule;
    });

    return {
      success: true,
      message: 'Horario del personal actualizado exitosamente',
      data: updatedSchedule,
    };
  }
} 