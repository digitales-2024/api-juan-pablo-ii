import { Injectable } from '@nestjs/common';
import { CreateCalendarDto } from '../dto/create-calendar.dto';
import { CalendarRepository } from '../repositories/calendar.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Calendar } from '../entities/calendar.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateCalendarUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createCalendarDto: CreateCalendarDto,
    user: UserData,
  ): Promise<BaseApiResponse<Calendar>> {
    const newCalendar = await this.calendarRepository.transaction(async () => {
      // Create calendar
      const calendar = await this.calendarRepository.create({
        name: createCalendarDto.name,
        type: createCalendarDto.type,
        medicalAppointmentId: createCalendarDto.medicalAppointmentId,
        medicalConsultationId: createCalendarDto.medicalConsultationId,
        staffId: createCalendarDto.staffId,
        branchId: createCalendarDto.branchId,
        isActive: createCalendarDto.isActive,
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
      success: true,
      message: 'Calendario creado exitosamente',
      data: newCalendar,
    };
  }
}
