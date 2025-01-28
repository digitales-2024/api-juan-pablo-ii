import { Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    // Reactivar los eventos y registrar auditoría
    const reactivatedEvents = await this.eventRepository.transaction(
      async () => {
        const events = await this.eventRepository.reactivateMany(ids);

        // Registrar auditoría para cada evento reactivado
        await Promise.all(
          events.map((event) =>
            this.auditService.create({
              entityId: event.id,
              entityType: 'evento',
              action: AuditActionType.UPDATE,
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
      message: 'Eventos reactivados exitosamente',
      data: reactivatedEvents,
    };
  }
}
