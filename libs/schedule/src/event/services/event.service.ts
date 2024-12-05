import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { CreateEventDto, UpdateEventDto, DeleteEventDto } from '../dto';
import {
  CreateEventUseCase,
  UpdateEventUseCase,
  DeleteEventsUseCase,
  ReactivateEventUseCase,
} from '../use-cases';
import { eventErrorMessages } from '../errors/errors-event';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventsUseCase: DeleteEventsUseCase,
    private readonly reactivateEventUseCase: ReactivateEventUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Event',
      eventErrorMessages,
    );
  }

  /**
   * Crea un nuevo evento
   * @param createEventDto - DTO con los datos para crear el evento
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el evento creado
   * @throws {BadRequestException} Si ya existe un evento con los mismos datos
   * @throws {Error} Si ocurre un error al crear el evento
   */
  async create(
    createEventDto: CreateEventDto,
    user: UserData,
  ): Promise<HttpResponse<Event>> {
    try {
      return await this.createEventUseCase.execute(createEventDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un evento existente
   * @param id - ID del evento a actualizar
   * @param updateEventDto - DTO con los datos para actualizar el evento
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el evento actualizado
   * @throws {Error} Si ocurre un error al actualizar el evento
   */
  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: UserData,
  ): Promise<HttpResponse<Event>> {
    try {
      const currentEvent = await this.findById(id);

      if (!validateChanges(updateEventDto, currentEvent)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el evento',
          data: currentEvent,
        };
      }

      return await this.updateEventUseCase.execute(id, updateEventDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un evento por su ID
   * @param id - ID del evento a buscar
   * @returns El evento encontrado
   * @throws {NotFoundException} Si el evento no existe
   */
  async findOne(id: string): Promise<Event> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los eventos
   * @returns Una promesa que resuelve con una lista de todos los eventos
   * @throws {Error} Si ocurre un error al obtener los eventos
   */
  async findAll(): Promise<Event[]> {
    try {
      return this.eventRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un evento por su ID
   * @param id - ID del evento a buscar
   * @returns Una promesa que resuelve con el evento encontrado
   * @throws {BadRequestException} Si el evento no existe
   */
  async findById(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new BadRequestException('Evento no encontrado');
    }
    return event;
  }

  /**
   * Desactiva múltiples eventos
   * @param deleteEventDto - DTO con los IDs de los eventos a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los eventos desactivados
   * @throws {NotFoundException} Si algún evento no existe
   */
  async deleteMany(
    deleteEventDto: DeleteEventDto,
    user: UserData,
  ): Promise<HttpResponse<Event[]>> {
    try {
      validateArray(deleteEventDto.ids, 'IDs de eventos');
      return await this.deleteEventsUseCase.execute(deleteEventDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples eventos
   * @param ids - Lista de IDs de los eventos a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los eventos reactivados
   * @throws {NotFoundException} Si algún evento no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Event[]>> {
    try {
      validateArray(ids, 'IDs de eventos');
      return await this.reactivateEventUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }
}
