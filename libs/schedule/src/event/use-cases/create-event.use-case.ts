import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { Event } from '../entities/event.entity';
import { EventRepository } from '../repositories/event.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createEventDto: CreateEventDto,
    user: UserData,
  ): Promise<BaseApiResponse<Event>> {
    const newEvent = await this.eventRepository.transaction(async () => {
      // Create event
      const event = await this.eventRepository.create({
        calendarId: createEventDto.calendarId,
        type: createEventDto.type,
        name: createEventDto.name,
        description: createEventDto.description,
        startDate: createEventDto.startDate,
        endDate: createEventDto.endDate,
        color: createEventDto.color,
        permissionType: createEventDto.permissionType,
        permissionStatus: createEventDto.permissionStatus,
        duration: createEventDto.duration,
        patientId: createEventDto.patientId,
        staffId: createEventDto.staffId,
        isActive: createEventDto.isActive,
      });

      // Register audit
      await this.auditService.create({
        entityId: event.id,
        entityType: 'evento',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return event;
    });

    return {
      success: true,
      message: 'Evento creado exitosamente',
      data: newEvent,
    };
  }
}
