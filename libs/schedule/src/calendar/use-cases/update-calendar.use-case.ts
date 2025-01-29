import { Injectable } from '@nestjs/common';
import { UpdateCalendarDto } from '../dto/update-calendar.dto';
import { CalendarRepository } from '../repositories/calendar.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Calendar } from '../entities/calendar.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateCalendarUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateCalendarDto: UpdateCalendarDto,
    user: UserData,
  ): Promise<BaseApiResponse<Calendar>> {
    const updatedCalendar = await this.calendarRepository.transaction(
      async () => {
        // Update calendar
        const calendar = await this.calendarRepository.update(id, {
          name: updatedCalendar.name,
          type: updatedCalendar.type,
          medicalAppointmentId: updatedCalendar.medicalAppointmentId,
          medicalConsultationId: updatedCalendar.medicalConsultationId,
          staffId: updatedCalendar.staffId,
          branchId: updatedCalendar.branchId,
          isActive: updatedCalendar.isActive,
        });

        // Register audit
        await this.auditService.create({
          entityId: calendar.id,
          entityType: 'calendario',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return calendar;
      },
    );

    return {
      success: true,
      message: 'Calendario actualizado exitosamente',
      data: updatedCalendar,
    };
  }
}
