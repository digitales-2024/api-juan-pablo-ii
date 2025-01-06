import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { TypeMovementRepository } from '../repositories/type-movement.repository';
import { TypeMovement } from '../entities/type-movement.entity';
import { CreateTypeMovementDto } from '../dto/create-type-movement.dto';
import { UpdateTypeMovementDto } from '../dto/update-type-movement.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateTypeMovementUseCase } from '../use-cases/create-type-movement.use-case';
import { UpdateTypeMovementUseCase } from '../use-cases/update-type-movement.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { typeMovementErrorMessages } from '../errors/errors-type-movement';
import { DeleteTypeMovementDto } from '../dto';
import {
  DeleteTypeMovementUseCase,
  ReactivateTypeMovementUseCase,
} from '../use-cases';

@Injectable()
export class TypeMovementService {
  private readonly logger = new Logger(TypeMovementService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly typeMovementRepository: TypeMovementRepository,
    private readonly createTypeMovementUseCase: CreateTypeMovementUseCase,
    private readonly updateTypeMovementUseCase: UpdateTypeMovementUseCase,
    private readonly deleteTypeMovementUseCase: DeleteTypeMovementUseCase,
    private readonly reactivateTypeMovementUseCase: ReactivateTypeMovementUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'TypeMovement',
      typeMovementErrorMessages,
    );
  }

  /**
   * Crea un nuevo tipo de movimiento
   * @param createTypeMovementDto - DTO con los datos para crear el tipo de movimiento
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el tipo de movimiento creado
   * @throws {Error} Si ocurre un error al crear el tipo de movimiento
   */
  async create(
    createTypeMovementDto: CreateTypeMovementDto,
    user: UserData,
  ): Promise<HttpResponse<TypeMovement>> {
    try {
      return await this.createTypeMovementUseCase.execute(
        createTypeMovementDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
      throw error;
    }
  }

  /**
   * Actualiza un tipo de movimiento existente
   * @param id - ID del tipo de movimiento a actualizar
   * @param updateTypeMovementDto - DTO con los datos para actualizar el tipo de movimiento
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el tipo de movimiento actualizado
   * @throws {Error} Si ocurre un error al actualizar el tipo de movimiento
   */
  async update(
    id: string,
    updateTypeMovementDto: UpdateTypeMovementDto,
    user: UserData,
  ): Promise<HttpResponse<TypeMovement>> {
    try {
      const currentTypeMovement = await this.findById(id);

      if (!validateChanges(updateTypeMovementDto, currentTypeMovement)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el tipo de movimiento',
          data: currentTypeMovement,
        };
      }

      return await this.updateTypeMovementUseCase.execute(
        id,
        updateTypeMovementDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  /**
   * Busca un tipo de movimiento por su ID
   * @param id - ID del tipo de movimiento a buscar
   * @returns El tipo de movimiento encontrado
   * @throws {NotFoundException} Si el tipo de movimiento no existe
   */
  async findOne(id: string): Promise<TypeMovement> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Obtiene todos los tipos de movimiento
   * @returns Una promesa que resuelve con una lista de todos los tipos de movimiento
   * @throws {Error} Si ocurre un error al obtener los tipos de movimiento
   */
  async findAll(): Promise<TypeMovement[]> {
    try {
      return this.typeMovementRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca un tipo de movimiento por su ID
   * @param id - ID del tipo de movimiento a buscar
   * @returns Una promesa que resuelve con el tipo de movimiento encontrado
   * @throws {BadRequestException} Si el tipo de movimiento no existe
   */
  async findById(id: string): Promise<TypeMovement> {
    const typeMovement = await this.typeMovementRepository.findById(id);
    if (!typeMovement) {
      throw new BadRequestException('Tipo de movimiento no encontrado');
    }
    return typeMovement;
  }

  /**
   * Desactiva múltiples tipos de movimiento
   * @param deleteTypeMovementDto - DTO con los IDs de los tipos de movimiento a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de movimiento desactivados
   * @throws {NotFoundException} Si algún tipo de movimiento no existe
   */
  async deleteMany(
    deleteTypeMovementDto: DeleteTypeMovementDto,
    user: UserData,
  ): Promise<HttpResponse<TypeMovement[]>> {
    try {
      validateArray(deleteTypeMovementDto.ids, 'IDs de tipos de movimiento');
      return await this.deleteTypeMovementUseCase.execute(
        deleteTypeMovementDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
      throw error;
    }
  }

  /**
   * Reactiva múltiples tipos de movimiento
   * @param ids - Lista de IDs de los tipos de movimiento a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de movimiento reactivados
   * @throws {NotFoundException} Si algún tipo de movimiento no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<TypeMovement[]>> {
    try {
      validateArray(ids, 'IDs de tipos de movimiento');
      return await this.reactivateTypeMovementUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }
}
