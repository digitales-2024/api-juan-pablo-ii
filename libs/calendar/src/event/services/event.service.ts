import { Injectable, Logger } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { Event } from '../entities/event.entity';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { EventRepository } from '../repositories/event.repository';
import {
  CreateEventUseCase,
  DeleteEventsUseCase,
  ReactivateEventsUseCase,
  UpdateEventUseCase,

} from '../use-cases';
import { eventErrorMessages } from '../errors/errors-event';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { DeleteEventsDto } from '../dto/delete-events.dto';
import { EventType } from '../entities/event-type.enum';
import { CreateRecurrentEventsUseCase } from '../use-cases/create-recurrent-events.use-case';
import { FindEventsQueryDto } from '../dto/find-events-query.dto';
import { FindEventsByFilterUseCase } from '../use-cases/find-events-by-filter.use-case';
import { FindEventsByStaffScheduleUseCase } from '../use-cases/find-events-by-staff-schedule.use-case';
import { DeleteEventsByStaffScheduleUseCase } from '../use-cases/delete-events-by-staff-schedule.use-case';

/**
 * Servicio que implementa la lógica de negocio para eventos del calendario.
 * Utiliza EventRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 */
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventsUseCase: DeleteEventsUseCase,
    private readonly reactivateEventsUseCase: ReactivateEventsUseCase,
    private readonly createRecurrentEventsUseCase: CreateRecurrentEventsUseCase,
    private readonly findEventsByFilterUseCase: FindEventsByFilterUseCase,
    private readonly findEventsByStaffScheduleUseCase: FindEventsByStaffScheduleUseCase,
    private readonly deleteEventsByStaffScheduleUseCase: DeleteEventsByStaffScheduleUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Evento',
      eventErrorMessages,
    );
  }

  /**
   * Crea un nuevo evento.
   * @param createEventDto - DTO con los datos del evento a crear.
   * @param user - Datos del usuario que realiza la operación.
   * @returns Respuesta HTTP con el evento creado.
   * @throws {BadRequestException} Si los datos del evento son inválidos.
   */
  async create(
    createEventDto: CreateEventDto,
    user: UserData,
  ): Promise<BaseApiResponse<Event>> {
    try {
      return await this.createEventUseCase.execute(createEventDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un evento existente.
   * @param id - ID del evento a actualizar.
   * @param updateEventDto - DTO con los datos a actualizar.
   * @param user - Datos del usuario que realiza la operación.
   * @returns Respuesta HTTP con el evento actualizado.
   * @throws {BadRequestException} Si el evento no existe o los datos son inválidos.
   */
  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: UserData,
  ): Promise<BaseApiResponse<Event>> {
    try {
      this.logger.log(`=== INICIO: update para evento ${id} ===`);
      this.logger.log(`Datos de actualización: ${JSON.stringify(updateEventDto, null, 2)}`);
      
      this.logger.log(`Buscando evento actual con ID: ${id}`);
      const currentEvent = await this.findOne(id);
      this.logger.log(`Evento actual encontrado: ${JSON.stringify(currentEvent, null, 2)}`);

      // Verificar si hay cambios en color o status, que siempre queremos aplicar
      const hasColorOrStatusChanges = 
        (updateEventDto.color && updateEventDto.color !== currentEvent.color) ||
        (updateEventDto.status && updateEventDto.status !== currentEvent.status);
      
      this.logger.log(`¿Tiene cambios de color o estado? ${hasColorOrStatusChanges}`);
      if (updateEventDto.color) {
        this.logger.log(`Color en DTO: ${updateEventDto.color}, Color actual: ${currentEvent.color}`);
      }
      if (updateEventDto.status) {
        this.logger.log(`Status en DTO: ${updateEventDto.status}, Status actual: ${currentEvent.status}`);
      }

      // Verificar si hay otros cambios significativos
      const hasOtherChanges = validateChanges(updateEventDto, currentEvent);
      this.logger.log(`¿Tiene otros cambios significativos? ${hasOtherChanges}`);

      // Si no hay cambios significativos y tampoco hay cambios de color o estado, omitimos la actualización
      if (!hasOtherChanges && !hasColorOrStatusChanges) {
        this.logger.log('No hay cambios significativos, omitiendo actualización');
        this.logger.log(`=== FIN: update para evento ${id} (sin cambios) ===`);
        return {
          success: true,
          message: 'Evento actualizado correctamente',
          data: currentEvent,
        };
      }

      this.logger.log(`Actualizando evento ${id} con datos: ${JSON.stringify(updateEventDto, null, 2)}`);
      const result = await this.updateEventUseCase.execute(id, updateEventDto, user);
      this.logger.log(`Resultado de la actualización: ${JSON.stringify(result, null, 2)}`);
      this.logger.log(`=== FIN: update para evento ${id} (actualizado) ===`);
      return result;
    } catch (error) {
      this.logger.error(`Error en update para evento ${id}: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      this.logger.log(`=== FIN: update para evento ${id} (con error) ===`);
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un evento por su ID.
   * @param id - ID del evento a buscar.
   * @returns El evento encontrado.
   * @throws {BadRequestException} Si el evento no existe.
   */
  async findOne(id: string): Promise<Event> {
    try {
      this.logger.log(`=== INICIO: findOne para evento ${id} ===`);
      const event = await this.eventRepository.findById(id);
      
      if (event) {
        this.logger.log(`Evento encontrado: ${JSON.stringify(event, null, 2)}`);
      } else {
        this.logger.log(`No se encontró evento con ID ${id}`);
      }
      
      this.logger.log(`=== FIN: findOne para evento ${id} ===`);
      return event;
    } catch (error) {
      this.logger.error(`Error buscando evento ${id}: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los eventos.
   * @returns Lista de todos los eventos.
   */
  async findAll(): Promise<Event[]> {
    try {
      return this.eventRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Desactiva múltiples eventos.
   * @param deleteEventsDto - DTO con los IDs de los eventos a desactivar.
   * @param user - Datos del usuario que realiza la operación.
   * @returns Respuesta HTTP con los eventos desactivados.
   * @throws {BadRequestException} Si algún evento no existe.
   */
  async deleteMany(
    deleteEventsDto: DeleteEventsDto,
    user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    try {
      validateArray(deleteEventsDto.ids, 'IDs de eventos');
      return await this.deleteEventsUseCase.execute(deleteEventsDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples eventos.
   * @param ids - Lista de IDs de los eventos a reactivar.
   * @param user - Datos del usuario que realiza la operación.
   * @returns Respuesta HTTP con los eventos reactivados.
   * @throws {BadRequestException} Si algún evento no existe.
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    try {
      validateArray(ids, 'IDs de eventos');
      return await this.reactivateEventsUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  async createRecurrentEvents(
    staffScheduleId: string,
    user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    try {
      const response = await this.createRecurrentEventsUseCase.execute(staffScheduleId, user);
      return response;
    } catch (error) {
      this.errorHandler.handleError(error, 'creating')
    }
  }

  async findEventsByType(staffId: string, type: EventType, start: Date, end: Date): Promise<Event[]> {
    try {
      return this.eventRepository.findEventsByType(staffId, type, start, end);

    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene eventos basados en los filtros definidos en FindEventsQueryDto.
   * @param query - DTO con los filtros (staffId, type, branchId, status)
   * @returns Objeto con el arreglo de eventos filtrados.
   */
  async findEventsByFilter(query: FindEventsQueryDto): Promise<Event[]> {
    try {
      this.logger.debug(`Iniciando búsqueda con filtros: ${JSON.stringify(query)}`);
      const result = await this.findEventsByFilterUseCase.execute(query);
      this.logger.debug(`Eventos encontrados: ${result.events.length} resultados`);

      const mappedEvents = result.events.map(event => ({
        ...event,
        staff: {
          name: event.staff?.name || 'No asignado',
          lastName: event.staff?.lastName || ''
        },
        branch: {
          name: event.branch?.name || 'Sucursal no especificada'
        }
      }));

      this.logger.debug(`Mapeo completado. Datos extendidos: ${mappedEvents.length} eventos`);
      return mappedEvents;
    } catch (error) {
      this.logger.error(`Error en findEventsByFilter: ${error.message}`, error.stack);
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async findEventsByStaffSchedule(
    staffScheduleId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ events: Event[]; total: number }> {
    try {
      return await this.findEventsByStaffScheduleUseCase.execute(
        staffScheduleId,
        page,
        limit
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async deleteEventsByStaffSchedule(
    staffScheduleId: string,
    user: UserData,
  ): Promise<BaseApiResponse<number>> {
    try {
      return await this.deleteEventsByStaffScheduleUseCase.execute(staffScheduleId, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deleting');
    }
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
    try {
      this.logger.log(`=== INICIO: findAvailableTurn ===`);
      this.logger.log(`Buscando TURNO para staff: ${staffId}`);
      this.logger.log(`Fecha inicio (UTC): ${start.toISOString()}`);
      this.logger.log(`Fecha fin (UTC): ${end.toISOString()}`);

      const turn = await this.eventRepository.findAvailableTurn(staffId, start, end);

      if (turn) {
        this.logger.log(`TURNO encontrado: ${turn.id}`);
        this.logger.log(`TURNO horario: ${turn.start.toISOString()} - ${turn.end.toISOString()}`);
        this.logger.log(`TURNO detalles: ${JSON.stringify(turn, null, 2)}`);
      } else {
        this.logger.log(`No se encontró TURNO para el horario solicitado`);
      }

      this.logger.log(`=== FIN: findAvailableTurn ===`);
      return turn;
    } catch (error) {
      this.logger.error(`Error al buscar TURNO: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Actualiza directamente un evento sin pasar por la validación de cambios.
   * Útil para forzar actualizaciones de color y estado.
   * @param id - ID del evento a actualizar.
   * @param eventData - Datos completos del evento actualizado.
   * @returns El evento actualizado.
   */
  async directUpdate(id: string, eventData: any): Promise<Event> {
    try {
      this.logger.log(`=== INICIO: directUpdate para evento ${id} ===`);
      this.logger.log(`Datos completos para actualización directa: ${JSON.stringify(eventData, null, 2)}`);
      
      // Verificar que el evento exista
      await this.findOne(id);
      
      // Actualizar directamente a través del repositorio usando el nuevo método forceUpdate
      const updatedEvent = await this.eventRepository.forceUpdate(id, eventData);
      
      this.logger.log(`Evento actualizado directamente: ${JSON.stringify(updatedEvent, null, 2)}`);
      this.logger.log(`=== FIN: directUpdate para evento ${id} ===`);
      
      return updatedEvent;
    } catch (error) {
      this.logger.error(`Error en directUpdate para evento ${id}: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      this.logger.log(`=== FIN: directUpdate para evento ${id} (con error) ===`);
      this.errorHandler.handleError(error, 'updating');
    }
  }

}
