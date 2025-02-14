import { Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';

@Injectable()
export class FindEventsByStaffScheduleUseCase {
  constructor(private readonly eventRepository: EventRepository) { }

  async execute(
    staffScheduleId: string,
    page: number,
    limit: number
  ): Promise<{ events: any[]; total: number }> {
    const result = await this.eventRepository.findEventsByStaffScheduleId(
      staffScheduleId,
      page,
      Math.min(limit, 50)
    );

    return {
      events: result.events.map(event => ({
        ...event,
        staff: {
          name: event.staff?.name || 'No asignado',
          lastName: event.staff?.lastName || ''
        },
        branch: {
          name: event.branch?.name || 'Sucursal no especificada'
        }
      })),
      total: result.total
    };
  }
} 