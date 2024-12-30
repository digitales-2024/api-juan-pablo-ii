import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { Event } from '../entities/event.entity';
import { EventRepository } from '../repositories/event.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createEventDto: CreateEventDto,
    user: UserData,
  ): Promise<HttpResponse<Event>> {
    const newEvent = await this.eventRepository.transaction(async () => {
      // Create event
      const event = await this.eventRepository.create({
        calendarioId: createEventDto.calendarioId,
        appointmentId: createEventDto.appointmentId,
        titulo: createEventDto.titulo,
        descripcion: createEventDto.descripcion,
        fechaInicio: createEventDto.fechaInicio,
        fechaFin: createEventDto.fechaFin,
        todoElDia: createEventDto.todoElDia,
        tipo: createEventDto.tipo,
        color: createEventDto.color,
        esPermiso: createEventDto.esPermiso,
        tipoPermiso: createEventDto.tipoPermiso,
        estadoPermiso: createEventDto.estadoPermiso,
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
      statusCode: HttpStatus.CREATED,
      message: 'Evento creado exitosamente',
      data: newEvent,
    };
  }
}
