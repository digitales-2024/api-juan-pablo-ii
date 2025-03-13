import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Event } from '../entities/event.entity';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '@prisma/client';
import * as moment from 'moment-timezone';

@Injectable()
export class EventRepository extends BaseRepository<Event> {
  private readonly timeZone = 'America/Lima';

  constructor(prisma: PrismaService) {
    super(prisma, 'event');
  }

  async findEventsByStaff(staffId: string, start: Date, end: Date): Promise<Event[]> {
    return this.findMany({
      where: {
        staffId,
        start: { gte: start },
        end: { lte: end },
        isActive: true
      },
      include: {
        appointment: true,
        staffSchedule: true
      }
    });
  }

  async findConflictingEvents(staffId: string, start: Date, end: Date): Promise<Event[]> {
    return this.findMany({
      where: {
        staffId,
        OR: [
          { start: { lt: end }, end: { gt: start } }, // Eventos que se solapan
          { start: { gte: start }, end: { lte: end } } // Eventos completamente contenidos
        ],
        isActive: true
      }
    });
  }

  async updateEventStatus(eventId: string, status: EventStatus, color: string): Promise<Event> {
    return this.update(eventId, {
      status,
      color,
      isCancelled: status === EventStatus.CANCELLED
    });
  }

  async bulkCreateEvents(eventsData: any[]): Promise<Event[]> {
    return this.prisma.$transaction(async (tx) => {
      const createdEvents = [];
      for (const eventData of eventsData) {
        createdEvents.push(await tx.event.create({ data: eventData }));
      }
      return createdEvents;
    });
  }

  async findEventsByType(staffId: string, type: EventType, start: Date, end: Date): Promise<Event[]> {
    return this.findMany({
      where: {
        staffId,
        type,
        start: { gte: start },
        end: { lte: end }
      }
    });
  }

  /**
   * Crea múltiples eventos en la base de datos de manera transaccional
   * @param events - Array de eventos a crear
   * @returns Array con los eventos creados
   */
  async createEvents(events: Event[]): Promise<Event[]> {
    return this.prisma.$transaction(async (tx) => {
      const createdEvents = [];
      for (const event of events) {
        const eventData = {
          title: event.title,
          type: event.type,
          start: event.start,
          end: event.end,
          staffId: event.staffId,
          branchId: event.branchId,
          status: event.status,
          color: event.color,
          staffScheduleId: event.staffScheduleId,
          isActive: true,
          isCancelled: event.isCancelled,
          cancellationReason: event.cancellationReason
        };
        createdEvents.push(
          await tx.event.create({
            data: eventData,
            select: {
              id: true,
              title: true,
              type: true,
              start: true,
              end: true,
              staffId: true,
              branchId: true,
              status: true,
              color: true,
              staffScheduleId: true,
              isActive: true
            }
          })
        );
      }
      return createdEvents;
    });
  }

  async findMany(params?: {
    where?: any;
    orderBy?: any;
    include?: any;
  }): Promise<Event[]> {
    return this.prisma.event.findMany({
      ...params,
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
  }

  async findById(id: string): Promise<Event> {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        staff: { select: { name: true, lastName: true } },
        branch: { select: { name: true } }
      }
    });
  }

  async findEventsByStaffScheduleId(
    staffScheduleId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ events: Event[]; total: number }> {
    const take = Math.min(limit, 50); // Máximo 50 registros
    const skip = (page - 1) * take;

    const [total, events] = await Promise.all([
      this.prisma.event.count({ where: { staffScheduleId } }),
      this.prisma.event.findMany({
        where: { staffScheduleId },
        skip,
        take,
        include: {
          staff: { select: { name: true, lastName: true } },
          branch: { select: { name: true } }
        },
        orderBy: { start: 'asc' } // Ordenar por fecha de inicio
      })
    ]);

    return { events, total };
  }

  async deleteManyByStaffScheduleId(staffScheduleId: string): Promise<number> {
    return this.prisma.event.deleteMany({
      where: { staffScheduleId },
    }).then(result => result.count);
  }

  /**
   * Busca un TURNO disponible para un staff en un rango de tiempo específico
   * @param staffId - ID del staff
   * @param start - Fecha de inicio
   * @param end - Fecha de fin
   * @returns Evento TURNO si existe, null si no
   */
  async findAvailableTurn(
    staffId: string,
    start: Date,
    end: Date
  ): Promise<Event | null> {
    // Las fechas ya vienen en UTC, no necesitamos convertirlas
    console.log('Búsqueda de TURNO - Fechas recibidas:', {
      staffId,
      startUTC: start.toISOString(),
      endUTC: end.toISOString(),
      startPeru: moment(start).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss'),
      endPeru: moment(end).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss'),
      startDay: start.getUTCDate(),
      endDay: end.getUTCDate()
    });

    // Buscar todos los TURNOs para este staff en esta fecha para depuración
    // Modificamos la búsqueda para incluir un rango más amplio (±1 día) para capturar turnos que puedan cruzar días
    const startOfDayInPeru = moment.tz(start, this.timeZone).startOf('day');
    const endOfDayInPeru = moment.tz(start, this.timeZone).endOf('day');

    // Extendemos el rango de búsqueda para incluir turnos que puedan cruzar días
    const searchStart = startOfDayInPeru.clone().subtract(1, 'day').utc().toDate();
    const searchEnd = endOfDayInPeru.clone().add(1, 'day').utc().toDate();

    const allTurns = await this.prisma.event.findMany({
      where: {
        staffId,
        type: 'TURNO',
        status: 'CONFIRMED',
        isActive: true,
        // Buscamos turnos que puedan contener la hora de la cita
        OR: [
          // Turnos que comienzan antes o durante el día de la cita
          {
            start: {
              lte: endOfDayInPeru.utc().toDate()
            },
            end: {
              gte: startOfDayInPeru.utc().toDate()
            }
          }
        ]
      }
    });

    console.log(`Se encontraron ${allTurns.length} TURNOs para este staff en esta fecha:`,
      allTurns.map(t => ({
        id: t.id,
        start: t.start.toISOString(),
        end: t.end.toISOString(),
        startPeru: moment(t.start).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss'),
        endPeru: moment(t.end).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')
      }))
    );

    // Buscar el TURNO específico que contiene el horario solicitado
    // Simplificamos la consulta para verificar directamente si el rango de la cita está dentro de algún turno
    const turn = await this.prisma.event.findFirst({
      where: {
        staffId,
        type: 'TURNO',
        status: 'CONFIRMED',
        start: { lte: start },
        end: { gte: end },
        isActive: true
      }
    });

    console.log('TURNO encontrado para el horario específico:', {
      turnExists: !!turn,
      turnId: turn?.id,
      turnStartUTC: turn?.start?.toISOString(),
      turnEndUTC: turn?.end?.toISOString(),
      turnStartPeru: turn ? moment(turn.start).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss') : null,
      turnEndPeru: turn ? moment(turn.end).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss') : null
    });

    return turn;
  }

  /**
   * Actualiza forzadamente un evento sin validaciones adicionales
   * @param id - ID del evento a actualizar
   * @param eventData - Datos completos del evento
   * @returns Evento actualizado
   */
  async forceUpdate(id: string, eventData: any): Promise<Event> {
    console.log(`[EventRepository] Forzando actualización del evento ${id}`);
    console.log(`[EventRepository] Datos para actualización: ${JSON.stringify(eventData, null, 2)}`);
    
    // Verificar que el evento exista
    const exists = await this.findById(id);
    if (!exists) {
      console.log(`[EventRepository] Evento ${id} no encontrado`);
      throw new Error(`Event with id ${id} not found`);
    }
    
    console.log(`[EventRepository] Evento ${id} encontrado, procediendo con la actualización forzada`);
    
    // Actualizar directamente en la base de datos
    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        color: eventData.color || exists.color,
        status: eventData.status || exists.status,
        title: eventData.title || exists.title,
        start: eventData.start || exists.start,
        end: eventData.end || exists.end,
        staffId: eventData.staffId || exists.staffId,
        branchId: eventData.branchId || exists.branchId,
        updatedAt: new Date()
      },
      include: {
        staff: { select: { name: true, lastName: true } },
        branch: { select: { name: true } }
      }
    });
    
    console.log(`[EventRepository] Evento ${id} actualizado forzadamente`);
    console.log(`[EventRepository] Resultado: ${JSON.stringify(updatedEvent, null, 2)}`);
    
    return updatedEvent;
  }
}
