import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Event } from '../entities/event.entity';
import { EventType } from '../entities/event-type.enum';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventRepository extends BaseRepository<Event> {

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
    const [total, events] = await Promise.all([
      this.prisma.event.count({
        where: { staffScheduleId },
      }),
      this.prisma.event.findMany({
        where: { staffScheduleId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          staff: { select: { name: true, lastName: true } },
          branch: { select: { name: true } }
        }
      })
    ]);

    return { events, total };
  }

  async deleteManyByStaffScheduleId(staffScheduleId: string): Promise<number> {
    return this.prisma.event.deleteMany({
      where: { staffScheduleId },
    }).then(result => result.count);
  }
}
