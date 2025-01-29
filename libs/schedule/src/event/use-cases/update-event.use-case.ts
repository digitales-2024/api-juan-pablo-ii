import { Injectable } from '@nestjs/common';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../entities/event.entity';
import { EventRepository } from '../repositories/event.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateEventDto: UpdateEventDto,
    user: UserData,
  ): Promise<BaseApiResponse<Event>> {
    const updatedEvent = await this.eventRepository.transaction(async () => {
      // Update event
      const event = await this.eventRepository.update(id, {
        calendarId: updatedEvent.calendarId,
        type: updatedEvent.type,
        name: updatedEvent.name,
        description: updatedEvent.description,
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate,
        color: updatedEvent.color,
        permissionType: updatedEvent.permissionType,
        permissionStatus: updatedEvent.permissionStatus,
        duration: updatedEvent.duration,
        patientId: updatedEvent.patientId,
        staffId: updatedEvent.staffId,
        recurrenceId: updatedEvent.recurrenceId,
        isActive: updatedEvent.isActive,
      });

      // Register audit
      await this.auditService.create({
        entityId: event.id,
        entityType: 'evento',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return event;
    });

    return {
      success: true,
      message: 'Evento actualizado exitosamente',
      data: updatedEvent,
    };
  }
}
