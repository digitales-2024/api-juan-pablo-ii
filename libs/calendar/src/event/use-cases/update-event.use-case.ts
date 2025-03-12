import { Injectable } from '@nestjs/common';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../entities/event.entity';
import { AuditActionType } from '@prisma/client';
import { EventRepository } from '../repositories/event.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) { }

  async execute(
    id: string,
    updateEventDto: UpdateEventDto,
    user: UserData,
  ): Promise<BaseApiResponse<Event>> {
    const updatedEvent = await this.eventRepository.transaction(async () => {
      // Update event
      const event = await this.eventRepository.update(id, {
        color: updateEventDto.color,
        title: updateEventDto.title,
        type: updateEventDto.type,
        start: updateEventDto.start,
        end: updateEventDto.end,
        cancellationReason: updateEventDto.cancellationReason,
        staffScheduleId: updateEventDto.staffScheduleId,
        staffId: updateEventDto.staffId,
        branchId: updateEventDto.branchId,
      });

      // Register audit
      await this.auditService.create({
        entityId: event.id,
        entityType: 'event',
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