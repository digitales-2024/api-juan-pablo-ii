import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';
import { FindEventsQueryDto } from '../dto/find-events-query.dto';

@Injectable()
export class FindEventsByFilterUseCase {
  private readonly logger = new Logger(FindEventsByFilterUseCase.name);

  constructor(private readonly eventRepository: EventRepository) { }

  async execute(query: FindEventsQueryDto): Promise<{ events: Event[] }> {
    this.logger.debug(`Iniciando ejecución de findEventsByFilter con query: ${JSON.stringify(query)}`);

    const where: any = {
      isActive: true,
      AND: []
    };

    // Filtros individuales
    if (query.type) where.AND.push({ type: query.type });
    if (query.status) where.AND.push({ status: query.status });
    if (query.staffScheduleId) where.AND.push({ staffScheduleId: query.staffScheduleId });
    if (query.staffId) where.AND.push({ staffId: query.staffId });
    if (query.branchId) where.AND.push({ branchId: query.branchId });

    // Si no hay filtros en el AND, eliminarlo para evitar condiciones vacías
    if (where.AND.length === 0) {
      delete where.AND;
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