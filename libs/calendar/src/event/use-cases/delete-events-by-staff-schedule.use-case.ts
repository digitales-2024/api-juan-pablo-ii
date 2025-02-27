import { Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class DeleteEventsByStaffScheduleUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    staffScheduleId: string,
    user: UserData
  ): Promise<BaseApiResponse<number>> {
    const result = await this.eventRepository.transaction(async () => {
      // Primero obtenemos los eventos a eliminar
      const eventsToDelete = await this.eventRepository.findEventsByStaffScheduleId(staffScheduleId);
      
      // Eliminamos los eventos
      const deletedCount = await this.eventRepository.deleteManyByStaffScheduleId(staffScheduleId);

      // Registramos la auditoría para cada evento
      await Promise.all(
        eventsToDelete.events.map(event => 
          this.auditService.create({
            entityId: event.id,
            entityType: 'event',
            action: AuditActionType.DELETE,
            performedById: user.id,
            createdAt: new Date(),
          })
        )
      );

      return deletedCount;
    });

    return {
      success: true,
      message: `Se eliminaron ${result} eventos relacionados al horario`,
      data: result
    };
  }
} 