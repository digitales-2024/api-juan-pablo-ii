import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { StorageRepository } from '../repositories/storage.repository';
import { Storage } from '../entities/storage.entity';
import { CreateStorageDto } from '../dto/create-storage.dto';
import { UpdateStorageDto } from '../dto/update-storage.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateStorageUseCase } from '../use-cases/create-storage.use-case';
import { UpdateStorageUseCase } from '../use-cases/update-storage.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { storageErrorMessages } from '../errors/errors-storage';
import { DeleteStorageDto } from '../dto';
import { DeleteStorageUseCase, ReactivateStorageUseCase } from '../use-cases';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly storageRepository: StorageRepository,
    private readonly createStorageUseCase: CreateStorageUseCase,
    private readonly updateStorageUseCase: UpdateStorageUseCase,
    private readonly deleteStorageUseCase: DeleteStorageUseCase,
    private readonly reactivateStorageUseCase: ReactivateStorageUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Storage',
      storageErrorMessages,
    );
  }

  /**
   * Crea un nuevo almacén
   * @param createStorageDto - DTO con los datos para crear el almacén
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el almacén creado
   * @throws {BadRequestException} Si ya existe un almacén con el mismo nombre
   * @throws {Error} Si ocurre un error al crear el almacén
   */
  async create(
    createStorageDto: CreateStorageDto,
    user: UserData,
  ): Promise<HttpResponse<Storage>> {
    try {
      // Validar si existe un almacén con el mismo nombre
      const nameExists = await this.findByName(createStorageDto.name);

      if (nameExists) {
        throw new BadRequestException('Ya existe un almacén con este nombre');
      }

      return await this.createStorageUseCase.execute(createStorageDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un almacén existente
   * @param id - ID del almacén a actualizar
   * @param updateStorageDto - DTO con los datos para actualizar el almacén
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el almacén actualizado
   * @throws {BadRequestException} Si ya existe un almacén con el mismo nombre
   * @throws {Error} Si ocurre un error al actualizar el almacén
   */
  async update(
    id: string,
    updateStorageDto: UpdateStorageDto,
    user: UserData,
  ): Promise<HttpResponse<Storage>> {
    try {
      const currentStorage = await this.findById(id);

      if (!validateChanges(updateStorageDto, currentStorage)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el almacén',
          data: currentStorage,
        };
      }

      // Validar si existe otro almacén con el mismo nombre
      if (updateStorageDto.name) {
        const nameExists = await this.findByName(updateStorageDto.name);
        if (nameExists && currentStorage.name !== updateStorageDto.name) {
          throw new BadRequestException('Ya existe un almacén con este nombre');
        }
      }

      return await this.updateStorageUseCase.execute(
        id,
        updateStorageDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un almacén por su ID
   * @param id - ID del almacén a buscar
   * @returns El almacén encontrado
   * @throws {NotFoundException} Si el almacén no existe
   */
  async findOne(id: string): Promise<Storage> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los almacenes
   * @returns Una promesa que resuelve con una lista de todos los almacenes
   * @throws {Error} Si ocurre un error al obtener los almacenes
   */
  async findAll(): Promise<Storage[]> {
    try {
      return this.storageRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un almacén por su ID
   * @param id - ID del almacén a buscar
   * @returns Una promesa que resuelve con el almacén encontrado
   * @throws {BadRequestException} Si el almacén no existe
   */
  async findById(id: string): Promise<Storage> {
    const storage = await this.storageRepository.findById(id);
    if (!storage) {
      throw new BadRequestException('Almacén no encontrado');
    }
    return storage;
  }

  /**
   * Desactiva múltiples almacenes
   * @param deleteStorageDto - DTO con los IDs de los almacenes a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los almacenes desactivados
   * @throws {NotFoundException} Si algún almacén no existe
   */
  async deleteMany(
    deleteStorageDto: DeleteStorageDto,
    user: UserData,
  ): Promise<HttpResponse<Storage[]>> {
    try {
      validateArray(deleteStorageDto.ids, 'IDs de almacenes');
      return await this.deleteStorageUseCase.execute(deleteStorageDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples almacenes
   * @param ids - Lista de IDs de los almacenes a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los almacenes reactivados
   * @throws {NotFoundException} Si algún almacén no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Storage[]>> {
    try {
      validateArray(ids, 'IDs de almacenes');
      return await this.reactivateStorageUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Verifica si existe un almacén con el nombre especificado
   * @param name - Nombre a buscar
   * @returns true si existe el almacén, false si no existe
   */
  async findByName(name: string): Promise<boolean> {
    const result = await this.storageRepository.findByField('name', name);
    return result && result.length > 0 ? true : false;
  }
}