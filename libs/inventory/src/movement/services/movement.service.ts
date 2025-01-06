import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { MovementRepository } from '../repositories/movement.repository';
import { Movement } from '../entities/movement.entity';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { UpdateMovementDto } from '../dto/update-movement.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateMovementUseCase } from '../use-cases/create-movement.use-case';
import { UpdateMovementUseCase } from '../use-cases/update-movement.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { movementErrorMessages } from '../errors/errors-movement';
import { DeleteMovementDto } from '../dto';
import { DeleteMovementUseCase, ReactivateMovementUseCase } from '../use-cases';

@Injectable()
export class MovementService {
  private readonly logger = new Logger(MovementService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly createMovementUseCase: CreateMovementUseCase,
    private readonly updateMovementUseCase: UpdateMovementUseCase,
    private readonly deleteMovementUseCase: DeleteMovementUseCase,
    private readonly reactivateMovementUseCase: ReactivateMovementUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Movement',
      movementErrorMessages,
    );
  }

  /**
   * Crea un nuevo movimiento
   * @param createMovementDto - DTO con los datos para crear el movimiento
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el movimiento creado
   * @throws {Error} Si ocurre un error al crear el movimiento
   */
  async create(
    createMovementDto: CreateMovementDto,
    user: UserData,
  ): Promise<HttpResponse<Movement>> {
    try {
      return await this.createMovementUseCase.execute(createMovementDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
      throw error;
    }
  }

  /**
   * Actualiza un movimiento existente
   * @param id - ID del movimiento a actualizar
   * @param updateMovementDto - DTO con los datos para actualizar el movimiento
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el movimiento actualizado
   * @throws {Error} Si ocurre un error al actualizar el movimiento
   */
  async update(
    id: string,
    updateMovementDto: UpdateMovementDto,
    user: UserData,
  ): Promise<HttpResponse<Movement>> {
    try {
      const currentMovement = await this.findById(id);

      if (!validateChanges(updateMovementDto, currentMovement)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el movimiento',
          data: currentMovement,
        };
      }

      return await this.updateMovementUseCase.execute(
        id,
        updateMovementDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  /**
   * Busca un movimiento por su ID
   * @param id - ID del movimiento a buscar
   * @returns El movimiento encontrado
   * @throws {NotFoundException} Si el movimiento no existe
   */
  async findOne(id: string): Promise<Movement> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Obtiene todos los movimientos
   * @returns Una promesa que resuelve con una lista de todos los movimientos
   * @throws {Error} Si ocurre un error al obtener los movimientos
   */
  async findAll(): Promise<Movement[]> {
    try {
      return this.movementRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca un movimiento por su ID
   * @param id - ID del movimiento a buscar
   * @returns Una promesa que resuelve con el movimiento encontrado
   * @throws {BadRequestException} Si el movimiento no existe
   */
  async findById(id: string): Promise<Movement> {
    const movement = await this.movementRepository.findById(id);
    if (!movement) {
      throw new BadRequestException('Movimiento no encontrado');
    }
    return movement;
  }

  /**
   * Desactiva múltiples movimientos
   * @param deleteMovementDto - DTO con los IDs de los movimientos a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los movimientos desactivados
   * @throws {NotFoundException} Si algún movimiento no existe
   */
  async deleteMany(
    deleteMovementDto: DeleteMovementDto,
    user: UserData,
  ): Promise<HttpResponse<Movement[]>> {
    try {
      validateArray(deleteMovementDto.ids, 'IDs de movimientos');
      return await this.deleteMovementUseCase.execute(deleteMovementDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
      throw error;
    }
  }

  /**
   * Reactiva múltiples movimientos
   * @param ids - Lista de IDs de los movimientos a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los movimientos reactivados
   * @throws {NotFoundException} Si algún movimiento no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Movement[]>> {
    try {
      validateArray(ids, 'IDs de movimientos');
      return await this.reactivateMovementUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }
}
