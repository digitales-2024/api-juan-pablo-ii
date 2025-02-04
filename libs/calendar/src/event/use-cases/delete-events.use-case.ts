import { Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Event } from '../entities/event.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteEventsDto } from '../dto/delete-events.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteEventsUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteEventsDto: DeleteEventsDto,
    user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    const deletedEvents = await this.eventRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los eventos actualizados
        const events = await this.eventRepository.softDeleteMany(
          deleteEventsDto.ids,
        );

        // Registra la auditoría para cada evento eliminado
        await Promise.all(
          events.map((event) =>
            this.auditService.create({
              entityId: event.id,
              entityType: 'event',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return events;
      },
    );

    return {
      success: true,
      message: 'Eventos desactivados exitosamente',
      data: deletedEvents,
    };
  }
} 