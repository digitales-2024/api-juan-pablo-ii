import { Injectable } from '@nestjs/common';
import { CalendarRepository } from '../repositories/calendar.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteCalendarDto } from '../dto/delete-calendar.dto';
import { Calendar } from '../entities/calendar.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteCalendarsUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteCalendarsDto: DeleteCalendarDto,
    user: UserData,
  ): Promise<BaseApiResponse<Calendar[]>> {
    const deletedCalendars = await this.calendarRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los calendarios actualizados
        const calendars = await this.calendarRepository.softDeleteMany(
          deleteCalendarsDto.ids,
        );

        // Registra la auditoría para cada calendario eliminado
        await Promise.all(
          calendars.map((calendar) =>
            this.auditService.create({
              entityId: calendar.id,
              entityType: 'calendario',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return calendars;
      },
    );

    return {
      success: true,
      message: 'Calendarios eliminados exitosamente',
      data: deletedCalendars,
    };
  }
}
