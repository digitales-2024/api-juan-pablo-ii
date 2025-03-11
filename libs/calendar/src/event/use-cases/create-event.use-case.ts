import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.entity';
import { EventRepository } from '../repositories/event.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType, EventStatus } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventType } from '../entities/event-type.enum';
import { Logger } from '@nestjs/common';

@Injectable()
export class CreateEventUseCase {
  private readonly logger = new Logger(CreateEventUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) { }

  async execute(
    createEventDto: CreateEventDto,
    user: UserData,
  ): Promise<BaseApiResponse<Event>> {
    // Verificar si hay eventos conflictivos, excepto para eventos de tipo CITA
    if (createEventDto.type !== EventType.CITA) {
      this.logger.log(`Verificando conflictos para evento de tipo ${createEventDto.type}`);
      const conflictingEvents = await this.eventRepository.findConflictingEvents(
        createEventDto.staffId,
        createEventDto.start,
        createEventDto.end,
      );

      if (conflictingEvents.length > 0) {
        this.logger.warn(`Se encontraron ${conflictingEvents.length} eventos conflictivos`);
        throw new Error('Ya existe un evento programado para este horario');
      }
    } else {
      this.logger.log(`Omitiendo verificación de conflictos para evento de tipo CITA`);
    }

    // Crear el evento usando una transacción
    const newEvent = await this.eventRepository.transaction(async () => {
      // Crear el evento
      const event = await this.eventRepository.create({
        ...createEventDto,
        status: EventStatus.CONFIRMED,
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
