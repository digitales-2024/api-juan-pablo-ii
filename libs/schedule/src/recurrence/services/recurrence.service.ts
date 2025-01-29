import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RecurrenceRepository } from '../repositories/recurrence.repository';
import { Recurrence } from '../entities/recurrence.entity';
import { CreateRecurrenceDto } from '../dto/create-recurrence.dto';
import { UpdateRecurrenceDto } from '../dto/update-recurrence.dto';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import {
  CreateRecurrenceUseCase,
  UpdateRecurrenceUseCase,
  DeleteRecurrencesUseCase,
  ReactivateRecurrenceUseCase,
} from '../use-cases';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { recurrenceErrorMessages } from '../errors/errors-recurrence';
import { DeleteRecurrenceDto } from '../dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class RecurrenceService {
  private readonly logger = new Logger(RecurrenceService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly createRecurrenceUseCase: CreateRecurrenceUseCase,
    private readonly updateRecurrenceUseCase: UpdateRecurrenceUseCase,
    private readonly deleteRecurrencesUseCase: DeleteRecurrencesUseCase,
    private readonly reactivateRecurrenceUseCase: ReactivateRecurrenceUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Recurrence',
      recurrenceErrorMessages,
    );
  }

  /**
   * Crea una nueva recurrencia
   * @param createRecurrenceDto - DTO con los datos para crear la recurrencia
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene la recurrencia creada
   * @throws {Error} Si ocurre un error al crear la recurrencia
   */
  async create(
    createRecurrenceDto: CreateRecurrenceDto,
    user: UserData,
  ): Promise<BaseApiResponse<Recurrence>> {
    try {
      return await this.createRecurrenceUseCase.execute(
        createRecurrenceDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza una recurrencia existente
   * @param id - ID de la recurrencia a actualizar
   * @param updateRecurrenceDto - DTO con los datos para actualizar la recurrencia
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene la recurrencia actualizada
   * @throws {Error} Si ocurre un error al actualizar la recurrencia
   */
  async update(
    id: string,
    updateRecurrenceDto: UpdateRecurrenceDto,
    user: UserData,
  ): Promise<BaseApiResponse<Recurrence>> {
    try {
      const currentRecurrence = await this.findById(id);

      if (!validateChanges(updateRecurrenceDto, currentRecurrence)) {
        return {
          success: true,
          message: 'No se detectaron cambios en la recurrencia',
          data: currentRecurrence,
        };
      }

      return await this.updateRecurrenceUseCase.execute(
        id,
        updateRecurrenceDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca una recurrencia por su ID
   * @param id - ID de la recurrencia a buscar
   * @returns La recurrencia encontrada
   * @throws {NotFoundException} Si la recurrencia no existe
   */
  async findOne(id: string): Promise<Recurrence> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todas las recurrencias
   * @returns Una promesa que resuelve con una lista de todas las recurrencias
   * @throws {Error} Si ocurre un error al obtener las recurrencias
   */
  async findAll(): Promise<Recurrence[]> {
    try {
      return this.recurrenceRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una recurrencia por su ID
   * @param id - ID de la recurrencia a buscar
   * @returns Una promesa que resuelve con la recurrencia encontrada
   * @throws {BadRequestException} Si la recurrencia no existe
   */
  async findById(id: string): Promise<Recurrence> {
    const recurrence = await this.recurrenceRepository.findById(id);
    if (!recurrence) {
      throw new BadRequestException('Recurrencia no encontrada');
    }
    return recurrence;
  }

  /**
   * Desactiva múltiples recurrencias
   * @param deleteRecurrenceDto - DTO con los IDs de las recurrencias a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las recurrencias desactivadas
   * @throws {NotFoundException} Si alguna recurrencia no existe
   */
  async deleteMany(
    deleteRecurrenceDto: DeleteRecurrenceDto,
    user: UserData,
  ): Promise<BaseApiResponse<Recurrence[]>> {
    try {
      validateArray(deleteRecurrenceDto.ids, 'IDs de recurrencias');
      return await this.deleteRecurrencesUseCase.execute(
        deleteRecurrenceDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples recurrencias
   * @param ids - Lista de IDs de las recurrencias a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las recurrencias reactivadas
   * @throws {NotFoundException} Si alguna recurrencia no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Recurrence[]>> {
    try {
      validateArray(ids, 'IDs de recurrencias');
      return await this.reactivateRecurrenceUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }
}
