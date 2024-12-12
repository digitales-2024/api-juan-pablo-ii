import { HttpStatus, Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteEventDto } from '../dto/delete-event.dto';

@Injectable()
export class DeleteEventsUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteEventsDto: DeleteEventDto,
    user: UserData,
  ): Promise<HttpResponse<Event[]>> {
    const deletedEvents = await this.eventRepository.transaction(async () => {
      // Realiza el soft delete y obtiene los eventos actualizados
      const events = await this.eventRepository.softDeleteMany(
        deleteEventsDto.ids,
      );

      // Registra la auditoría para cada evento eliminado
      await Promise.all(
        events.map((event) =>
          this.auditService.create({
            entityId: event.id,
            entityType: 'evento',
            action: AuditActionType.DELETE,
            performedById: user.id,
            createdAt: new Date(),
          }),
        ),
      );

      return events;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Eventos eliminados exitosamente',
      data: deletedEvents,
    };
  }
}
