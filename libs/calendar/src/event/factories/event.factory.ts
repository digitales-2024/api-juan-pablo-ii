import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { Event } from '../entities/event.entity';
import { EventType } from '../entities/event-type.enum';
import { StaffSchedule } from 'src/modules/staff-schedule/entities/staff-schedule.entity';
import { RecurrenceParser } from '@calendar/calendar/utils/recurrence-parser';
import { formatInTimeZone } from 'date-fns-tz';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventFactory {
  constructor(private recurrenceParser: RecurrenceParser) {}

  createBaseEvent(dto: CreateEventDto): Event {
    const event = new Event();
    event.title = dto.title || this.generateDefaultTitle(dto.type);
    event.type = dto.type;
    event.start = dto.start;
    event.end = dto.end;
    event.staffId = dto.staffId;
    event.branchId = dto.branchId;
    event.isCancelled = false;
    event.createdAt = new Date();
    event.updatedAt = new Date();

    switch (dto.type) {
      case EventType.TURNO:
        return this.configureTurnoEvent(event, dto);
    //   case EventType.CITA:
        // return this.configureCitaEvent(event, dto);
    //   case EventType.OTRO:
    //     return this.configureOtroEvent(event, dto);
      default:
        throw new Error(`Tipo de evento no soportado: ${dto.type}`);
    }
  }

  private configureTurnoEvent(event: Event, dto: CreateEventDto): Event {
    if (!dto.staffScheduleId) throw new Error('StaffScheduleId requerido para TURNO');
    
    event.status = EventStatus.CONFIRMED;
    event.color = dto.color;
    event.staffScheduleId = dto.staffScheduleId;
    return event;
  }

  private generateDefaultTitle(type: EventType): string {
    const titles = {
      [EventType.TURNO]: 'Turno de Trabajo',
      [EventType.CITA]: 'Cita Médica',
      [EventType.OTRO]: 'Evento General'
    };
    return titles[type];
  }

  // Método nuevo para generar eventos recurrentes
  async generateRecurrentEvents(baseEvent: Event, staffSchedule: StaffSchedule): Promise<Event[]> {
    const recurrenceRule = {
      frequency: staffSchedule.recurrence.frequency,
      interval: staffSchedule.recurrence.interval,
      until: staffSchedule.recurrence.until
    };
  
    try {
      const dates = this.recurrenceParser.generateDates(
        baseEvent.start, 
        recurrenceRule,
        staffSchedule.daysOfWeek
      );
      
      // Filtrar excepciones
      const filteredDates = dates.filter(date => {
        const dateString = formatInTimeZone(date, 'America/Lima', 'yyyy-MM-dd');
        return !staffSchedule.exceptions.includes(dateString);
      });

      return filteredDates.map(date => {
        const event = new Event();
        Object.assign(event, {...baseEvent});
        
        event.start = date;
        const durationMs = baseEvent.end.getTime() - baseEvent.start.getTime();
        event.end = new Date(date.getTime() + durationMs);
        
        event.isBaseEvent = false;
        event.status = EventStatus.CONFIRMED;
        event.staffScheduleId = staffSchedule.id;
        
        return event;
      });
    } catch (error) {
      console.error('Error en generateRecurrentEvents:', error);
      throw error;
    }
  }
}