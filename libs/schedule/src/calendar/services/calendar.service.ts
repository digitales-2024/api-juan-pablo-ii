import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CalendarRepository } from '../repositories/calendar.repository';
import {
  CreateCalendarDto,
  UpdateCalendarDto,
  DeleteCalendarDto,
} from '../dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { calendarErrorMessages } from '../errors/errors-calendar';
import {
  CreateCalendarUseCase,
  UpdateCalendarUseCase,
  DeleteCalendarsUseCase,
  ReactivateCalendarUseCase,
} from '../use-cases';
import { Calendar } from '../entities/pacient.entity';
import { BranchRepository } from 'src/modules/branch/repositories/branch.repository';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly createCalendarUseCase: CreateCalendarUseCase,
    private readonly updateCalendarUseCase: UpdateCalendarUseCase,
    private readonly deleteCalendarsUseCase: DeleteCalendarsUseCase,
    private readonly reactivateCalendarUseCase: ReactivateCalendarUseCase,
    private readonly branchRepository: BranchRepository,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Calendar',
      calendarErrorMessages,
    );
  }

  /**
   * Crea un nuevo calendario
   * @param createCalendarDto - DTO con los datos para crear el calendario
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el calendario creado
   * @throws {BadRequestException} Si ya existe un calendario con los mismos datos
   * @throws {Error} Si ocurre un error al crear el calendario
   */
  async create(
    createCalendarDto: CreateCalendarDto,
    user: UserData,
  ): Promise<HttpResponse<Calendar>> {
    try {
      const branchExist = await this.branchRepository.findBranchById(
        createCalendarDto.sucursalId,
      );
      if (!branchExist) {
        throw new BadRequestException('No existe la sucursal');
      }
      return await this.createCalendarUseCase.execute(createCalendarDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un calendario existente
   * @param id - ID del calendario a actualizar
   * @param updateCalendarDto - DTO con los datos para actualizar el calendario
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el calendario actualizado
   * @throws {Error} Si ocurre un error al actualizar el calendario
   */
  async update(
    id: string,
    updateCalendarDto: UpdateCalendarDto,
    user: UserData,
  ): Promise<HttpResponse<Calendar>> {
    try {
      const currentCalendar = await this.findById(id);

      if (!validateChanges(updateCalendarDto, currentCalendar)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el calendario',
          data: currentCalendar,
        };
      }

      return await this.updateCalendarUseCase.execute(
        id,
        updateCalendarDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un calendario por su ID
   * @param id - ID del calendario a buscar
   * @returns El calendario encontrado
   * @throws {NotFoundException} Si el calendario no existe
   */
  async findOne(id: string): Promise<Calendar> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los calendarios
   * @returns Una promesa que resuelve con una lista de todos los calendarios
   * @throws {Error} Si ocurre un error al obtener los calendarios
   */
  async findAll(): Promise<Calendar[]> {
    try {
      return this.calendarRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un calendario por su ID
   * @param id - ID del calendario a buscar
   * @returns Una promesa que resuelve con el calendario encontrado
   * @throws {BadRequestException} Si el calendario no existe
   */
  async findById(id: string): Promise<Calendar> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new BadRequestException('Calendario no encontrado');
    }
    return calendar;
  }

  /**
   * Desactiva múltiples calendarios
   * @param deleteCalendarDto - DTO con los IDs de los calendarios a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los calendarios desactivados
   * @throws {NotFoundException} Si algún calendario no existe
   */
  async deleteMany(
    deleteCalendarDto: DeleteCalendarDto,
    user: UserData,
  ): Promise<HttpResponse<Calendar[]>> {
    try {
      validateArray(deleteCalendarDto.ids, 'IDs de calendarios');
      return await this.deleteCalendarsUseCase.execute(deleteCalendarDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples calendarios
   * @param ids - Lista de IDs de los calendarios a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los calendarios reactivados
   * @throws {NotFoundException} Si algún calendario no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Calendar[]>> {
    try {
      validateArray(ids, 'IDs de calendarios');
      return await this.reactivateCalendarUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }
}
