import { Injectable } from '@nestjs/common';
import { CalendarRepository } from '../repositories/calendar.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Calendar } from '../entities/calendar.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateCalendarUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Calendar[]>> {
    // Reactivar los calendarios y registrar auditoría
    const reactivatedCalendars = await this.calendarRepository.transaction(
      async () => {
        const calendars = await this.calendarRepository.reactivateMany(ids);

        // Registrar auditoría para cada calendario reactivado
        await Promise.all(
          calendars.map((calendar) =>
            this.auditService.create({
              entityId: calendar.id,
              entityType: 'calendario',
              action: AuditActionType.UPDATE,
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
      message: 'Calendarios reactivados exitosamente',
      data: reactivatedCalendars,
    };
  }
}
