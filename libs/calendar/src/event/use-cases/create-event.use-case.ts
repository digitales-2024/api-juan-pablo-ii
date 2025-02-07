import { Injectable } from '@nestjs/common';
import { Event} from '../entities/event.entity';
import { EventRepository } from '../repositories/event.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType, EventStatus } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateEventDto } from '../dto/create-event.dto';

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
    // Verificar si hay eventos conflictivos
    const conflictingEvents = await this.eventRepository.findConflictingEvents(
      createEventDto.staffId,
      createEventDto.start,
      createEventDto.end,
    );

    if (conflictingEvents.length > 0) {
      throw new Error('Ya existe un evento programado para este horario');
    }

    // Crear el evento usando una transacción
    const newEvent = await this.eventRepository.transaction(async () => {
      // Crear el evento
      const event = await this.eventRepository.create({
        ...createEventDto,
        status: EventStatus.PENDING,
        isCancelled: false,
        isActive: true,
      });

      // Registrar auditoría
      await this.auditService.create({
        entityId: event.id,
        entityType: 'event',
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
