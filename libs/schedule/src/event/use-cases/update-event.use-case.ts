import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../entities/event.entity';
import { EventRepository } from '../repositories/event.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

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
  ): Promise<HttpResponse<Event>> {
    const updatedEvent = await this.eventRepository.transaction(async () => {
      // Update event
      const event = await this.eventRepository.update(id, {
        calendarioId: updateEventDto.calendarioId,
        titulo: updateEventDto.titulo,
        descripcion: updateEventDto.descripcion,
        fechaInicio: updateEventDto.fechaInicio,
        fechaFin: updateEventDto.fechaFin,
        todoElDia: updateEventDto.todoElDia,
        tipo: updateEventDto.tipo,
        color: updateEventDto.color,
        esPermiso: updateEventDto.esPermiso,
        tipoPermiso: updateEventDto.tipoPermiso,
        estadoPermiso: updateEventDto.estadoPermiso,
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
      statusCode: HttpStatus.OK,
      message: 'Evento actualizado exitosamente',
      data: updatedEvent,
    };
  }
}
