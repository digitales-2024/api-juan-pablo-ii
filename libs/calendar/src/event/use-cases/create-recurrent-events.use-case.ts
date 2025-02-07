import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { EventFactory } from '../factories/event.factory';
import { UserData } from '@login/login/interfaces';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType, StaffSchedule } from '@prisma/client';
import { EventType } from '../entities/event-type.enum';
import { CreateEventDto } from '../dto/create-event.dto';
import { StaffScheduleService } from 'src/modules/staff-schedule/services/staff-schedule.service';
import { Event } from '../entities/event.entity';
import { setMinutes, setHours, startOfDay } from 'date-fns';
import { toDate } from 'date-fns-tz';
import { formatInTimeZone } from 'date-fns-tz';

@Injectable()
export class CreateRecurrentEventsUseCase {
  private readonly logger = new Logger(CreateRecurrentEventsUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly staffScheduleService: StaffScheduleService,
    private readonly eventFactory: EventFactory,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    staffScheduleId: string,
    user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    this.logger.debug(`Ejecutando CreateRecurrentEventsUseCase con staffScheduleId: ${staffScheduleId} y usuario: ${JSON.stringify(user)}`);

    try {
      const staffSchedule = await this.staffScheduleService.findOne(staffScheduleId);
      this.logger.debug(`Horario del personal obtenido: ${JSON.stringify(staffSchedule)}`);

      if (!staffSchedule) {
        throw new Error('StaffSchedule no encontrado');
      }

      // Crear el DTO base para los eventos
      const baseEventDto = this.mapScheduleToEventDto(staffSchedule);

      // Generar eventos recurrentes
      const baseEvent = this.eventFactory.createBaseEvent(baseEventDto);
      const recurrentEvents = await this.eventFactory.generateRecurrentEvents(baseEvent, staffSchedule);
      
      // Remover la validación de ID ya que los eventos nuevos no tienen ID
      this.logger.debug(`Eventos recurrentes generados: ${JSON.stringify(recurrentEvents)}`);

      // Guardar los eventos en la base de datos
      const savedEvents = await this.eventRepository.createEvents(recurrentEvents);
      this.logger.debug(`Eventos recurrentes guardados: ${JSON.stringify(savedEvents)}`);

      // Registrar auditoría
      await this.auditService.create({
        entityId: staffScheduleId,
        entityType: 'staff-schedule',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return {
        success: true,
        message: 'Eventos recurrentes generados exitosamente',
        data: savedEvents,
      };
    } catch (error) {
      this.logger.error('Error en CreateRecurrentEventsUseCase.execute', error.stack);
      throw error;
    }
  }

  private mapScheduleToEventDto(staffSchedule: StaffSchedule): CreateEventDto {
    const today = new Date();
    this.logger.debug('Fecha base:', today.toISOString());
    
    // Crear la fecha con la hora local correcta
    const [startHours, startMinutes] = staffSchedule.startTime.split(':').map(Number);
    const [endHours, endMinutes] = staffSchedule.endTime.split(':').map(Number);
    
    // Crear fechas base usando date-fns-tz
    const startDate = setMinutes(
      setHours(startOfDay(today), startHours),
      startMinutes
    );
    
    const endDate = setMinutes(
      setHours(startOfDay(today), endHours),
      endMinutes
    );

    // Convertir a la zona horaria de Lima
    const limaStartDate = toDate(startDate, { timeZone: 'America/Lima' });
    const limaEndDate = toDate(endDate, { timeZone: 'America/Lima' });

    this.logger.debug('Fechas mapeadas:', {
      originalStartTime: staffSchedule.startTime,
      originalEndTime: staffSchedule.endTime,
      startDateLocal: formatInTimeZone(startDate, 'America/Lima', 'yyyy-MM-dd HH:mm:ss'),
      endDateLocal: formatInTimeZone(endDate, 'America/Lima', 'yyyy-MM-dd HH:mm:ss'),
      startDateUTC: startDate.toISOString(),
      endDateUTC: endDate.toISOString(),
      limaStartDate: formatInTimeZone(limaStartDate, 'America/Lima', 'yyyy-MM-dd HH:mm:ss'),
      limaEndDate: formatInTimeZone(limaEndDate, 'America/Lima', 'yyyy-MM-dd HH:mm:ss')
    });

    return {
      title: staffSchedule.title,
      type: EventType.TURNO,
      start: startDate,
      end: endDate,
      staffId: staffSchedule.staffId,
      branchId: staffSchedule.branchId,
      staffScheduleId: staffSchedule.id,
    };
  }
}