import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateCalendarDto } from '../dto/update-calendar.dto';
import { CalendarRepository } from '../repositories/calendar.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Calendar } from '../entities/pacient.entity';

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
  ): Promise<HttpResponse<Calendar>> {
    const updatedCalendar = await this.calendarRepository.transaction(
      async () => {
        // Update calendar
        const calendar = await this.calendarRepository.update(id, {
          personalId: updateCalendarDto.personalId,
          sucursalId: updateCalendarDto.sucursalId,
          nombre: updateCalendarDto.nombre,
          color: updateCalendarDto.color,
          isDefault: updateCalendarDto.isDefault,
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
      statusCode: HttpStatus.OK,
      message: 'Calendario actualizado exitosamente',
      data: updatedCalendar,
    };
  }
}
