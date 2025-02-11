import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';
import { FindEventsQueryDto } from '../dto/find-events-query.dto';

@Injectable()
export class FindEventsByFilterUseCase {
  private readonly logger = new Logger(FindEventsByFilterUseCase.name);

  constructor(private readonly eventRepository: EventRepository) {}

  async execute(query: FindEventsQueryDto): Promise<{ events: Event[] }> {
    this.logger.debug(`Iniciando ejecución de findEventsByFilter con query: ${JSON.stringify(query)}`);

    // Construir el objeto "where" dinámicamente
    const where: any = { isActive: true };

    if (query.staffId) {
      where.staffId = query.staffId;
    }

    if (query.type) {
      where.type = query.type;
    } else {
      where.type = 'turno'; // Valor por defecto si no se especifica el tipo
    }

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.staffScheduleId) {
        where.staffScheduleId = query.staffScheduleId;
    }

    this.logger.debug(`Objeto "where" construido: ${JSON.stringify(where)}`);

    // Consultar eventos ordenados por fecha de inicio (descendente)
    const events = await this.eventRepository.findMany({
      where,
      orderBy: { start: 'desc' },
      include: {
        staff: {
          select: {
            name: true,
            lastName: true
          }
        },
        branch: {
          select: {
            name: true
          }
        }
      }
    });

    this.logger.debug(`Eventos encontrados: ${JSON.stringify(events)}`);

    return { events };
  }
} 