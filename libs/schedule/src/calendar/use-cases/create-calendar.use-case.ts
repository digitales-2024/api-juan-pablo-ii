import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCalendarDto } from '../dto/create-calendar.dto';
import { CalendarRepository } from '../repositories/calendar.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Calendar } from '../entities/pacient.entity';

@Injectable()
export class CreateCalendarUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createCalendarDto: CreateCalendarDto,
    user: UserData,
  ): Promise<HttpResponse<Calendar>> {
    const newCalendar = await this.calendarRepository.transaction(async () => {
      // Create calendar
      const calendar = await this.calendarRepository.create({
        personalId: createCalendarDto.personalId,
        sucursalId: createCalendarDto.sucursalId,
        nombre: createCalendarDto.nombre,
        color: createCalendarDto.color,
        isDefault: createCalendarDto.isDefault,
      });

      // Register audit
      await this.auditService.create({
        entityId: calendar.id,
        entityType: 'calendario',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return calendar;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Calendario creado exitosamente',
      data: newCalendar,
    };
  }
}
