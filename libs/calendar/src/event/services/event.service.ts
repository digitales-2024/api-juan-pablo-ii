import { Injectable, Logger } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { Event } from '../entities/event.entity';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { EventRepository } from '../repositories/event.repository';
import {
  CreateEventUseCase,
 
} from '../use-cases';
import { eventErrorMessages } from '../errors/errors-event';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { CreateEventDto } from '../dto/create-event.dto';

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
    // private readonly updateEventUseCase: UpdateEventUseCase,
    // private readonly deleteEventsUseCase: DeleteEventsUseCase,
    // private readonly reactivateEventsUseCase: ReactivateEventsUseCase,
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

//   /**
//    * Actualiza un evento existente.
//    * @param id - ID del evento a actualizar.
//    * @param updateEventDto - DTO con los datos a actualizar.
//    * @param user - Datos del usuario que realiza la operación.
//    * @returns Respuesta HTTP con el evento actualizado.
//    * @throws {BadRequestException} Si el evento no existe o los datos son inválidos.
//    */
//   async update(
//     id: string,
//     updateEventDto: UpdateEventDto,
//     user: UserData,
//   ): Promise<BaseApiResponse<Event>> {
//     try {
//       const currentEvent = await this.findById(id);

//       if (!validateChanges(updateEventDto, currentEvent)) {
//         this.logger.log('No hay cambios significativos, omitiendo actualización');
//         return {
//           success: true,
//           message: 'Evento actualizado correctamente',
//           data: currentEvent,
//         };
//       }

//       return await this.updateEventUseCase.execute(id, updateEventDto, user);
//     } catch (error) {
//       this.errorHandler.handleError(error, 'updating');
//     }
//   }

  /**
   * Busca un evento por su ID.
   * @param id - ID del evento a buscar.
   * @returns El evento encontrado.
   * @throws {BadRequestException} Si el evento no existe.
   */
  async findOne(id: string): Promise<Event> {
    try {
      return await this.eventRepository.findById(id);
    } catch (error) {
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

//   /**
//    * Desactiva múltiples eventos.
//    * @param deleteEventsDto - DTO con los IDs de los eventos a desactivar.
//    * @param user - Datos del usuario que realiza la operación.
//    * @returns Respuesta HTTP con los eventos desactivados.
//    * @throws {BadRequestException} Si algún evento no existe.
//    */
//   async deleteMany(
//     deleteEventsDto: DeleteEventsDto,
//     user: UserData,
//   ): Promise<BaseApiResponse<Event[]>> {
//     try {
//       validateArray(deleteEventsDto.ids, 'IDs de eventos');
//       return await this.deleteEventsUseCase.execute(deleteEventsDto, user);
//     } catch (error) {
//       this.errorHandler.handleError(error, 'deactivating');
//     }
//   }

//   /**
//    * Reactiva múltiples eventos.
//    * @param ids - Lista de IDs de los eventos a reactivar.
//    * @param user - Datos del usuario que realiza la operación.
//    * @returns Respuesta HTTP con los eventos reactivados.
//    * @throws {BadRequestException} Si algún evento no existe.
//    */
//   async reactivateMany(
//     ids: string[],
//     user: UserData,
//   ): Promise<BaseApiResponse<Event[]>> {
//     try {
//       validateArray(ids, 'IDs de eventos');
//       return await this.reactivateEventsUseCase.execute(ids, user);
//     } catch (error) {
//       this.errorHandler.handleError(error, 'reactivating');
//     }
//   }

 
}
