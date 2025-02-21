import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TypeStorageRepository } from '../repositories/type-storage.repository';
import { TypeStorage } from '../entities/type-storage.entity';
import { CreateTypeStorageDto } from '../dto/create-type-storage.dto';
import { UpdateTypeStorageDto } from '../dto/update-type-storage.dto';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateTypeStorageUseCase } from '../use-cases/create-type-storage.use-case';
import { UpdateTypeStorageUseCase } from '../use-cases/update-type-storage.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { typeStorageErrorMessages } from '../errors/errors-type-storage';
import { DeleteTypeStorageDto } from '../dto';
import {
  DeleteTypeStorageUseCase,
  ReactivateTypeStorageUseCase,
} from '../use-cases';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class TypeStorageService {
  private readonly logger = new Logger(TypeStorageService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly typeStorageRepository: TypeStorageRepository,
    private readonly createTypeStorageUseCase: CreateTypeStorageUseCase,
    private readonly updateTypeStorageUseCase: UpdateTypeStorageUseCase,
    private readonly deleteTypeStorageUseCase: DeleteTypeStorageUseCase,
    private readonly reactivateTypeStorageUseCase: ReactivateTypeStorageUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'TypeStorage',
      typeStorageErrorMessages,
    );
  }

  /**
   * Crea un nuevo tipo de almacenamiento
   * @param createTypeStorageDto - DTO con los datos para crear el tipo de almacenamiento
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el tipo de almacenamiento creado
   * @throws {BadRequestException} Si ya existe un tipo de almacenamiento con el mismo nombre
   * @throws {Error} Si ocurre un error al crear el tipo de almacenamiento
   */
  async create(
    createTypeStorageDto: CreateTypeStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeStorage>> {
    try {
      // Validar si existe un tipo de almacenamiento con el mismo nombre
      /* const nameExists = await this.findByName(createTypeStorageDto.name);

      if (nameExists) {
        throw new BadRequestException(
          'Ya existe un tipo de almacenamiento con este nombre',
        );
      } */

      return await this.createTypeStorageUseCase.execute(
        createTypeStorageDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
      throw error;
    }
  }

  /**
   * Actualiza un tipo de almacenamiento existente
   * @param id - ID del tipo de almacenamiento a actualizar
   * @param updateTypeStorageDto - DTO con los datos para actualizar el tipo de almacenamiento
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el tipo de almacenamiento actualizado
   * @throws {BadRequestException} Si ya existe un tipo de almacenamiento con el mismo nombre
   * @throws {Error} Si ocurre un error al actualizar el tipo de almacenamiento
   */
  async update(
    id: string,
    updateTypeStorageDto: UpdateTypeStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeStorage>> {
    try {
      const currentTypeStorage = await this.findById(id);

      if (!validateChanges(updateTypeStorageDto, currentTypeStorage)) {
        return {
          success: true,
          message: 'No se detectaron cambios en el tipo de almacenamiento',
          data: currentTypeStorage,
        };
      }

      //Name Validation with prisma @unique

      return await this.updateTypeStorageUseCase.execute(
        id,
        updateTypeStorageDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un tipo de almacenamiento por su ID
   * @param id - ID del tipo de almacenamiento a buscar
   * @returns El tipo de almacenamiento encontrado
   * @throws {NotFoundException} Si el tipo de almacenamiento no existe
   */
  async findOne(id: string): Promise<BaseApiResponse<TypeStorage>> {
    try {
      const typeStorage = await this.findById(id);
      return {
        success: true,
        data: typeStorage,
        message: 'Tipo de almacenamiento encontrado',
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  // async findONeWIthRelations(id: string): Promise<DetailedTypeStorage[]> {
  //   try {
  //     const typeStorage = await this.typeStorageRepository.findOneWithRelations(
  //       id,
  //       {
  //         include: {
  //           staff: {
  //             select: {
  //               name: true,
  //             },
  //           },
  //           branch: {
  //             select: {
  //               name: true,
  //             },
  //           },
  //         },
  //       },
  //     );
  //     if (!typeStorage) {
  //       throw new BadRequestException('Tipo de almacenamiento no encontrado');
  //     }
  //     return this.typeStorageRepository.mapToEntity([typeStorage]);
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'getting');
  //   }
  // }

  /**
   * Obtiene todos los tipos de almacenamiento
   * @returns Una promesa que resuelve con una lista de todos los tipos de almacenamiento
   * @throws {Error} Si ocurre un error al obtener los tipos de almacenamiento
   */
  async findAll(): Promise<TypeStorage[]> {
    try {
      return this.typeStorageRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async findAllActive(): Promise<TypeStorage[]> {
    try {
      return this.typeStorageRepository.findManyActive();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  // async findAllWithRelations(): Promise<DetailedTypeStorage[]> {
  //   try {
  //     // const storages = await this.typeStorageRepository.findMany();
  //     const storages = await this.typeStorageRepository.findManyWithRelations({
  //       include: {
  //         staff: {
  //           select: {
  //             name: true,
  //           },
  //         },
  //         branch: {
  //           select: {
  //             name: true,
  //           },
  //         },
  //       },
  //     });
  //     return storages.map((storage) =>
  //       this.typeStorageRepository.mapToEntity(storage),
  //     );
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'getting');
  //   }
  // }

  /**
   * Busca un tipo de almacenamiento por su ID
   * @param id - ID del tipo de almacenamiento a buscar
   * @returns Una promesa que resuelve con el tipo de almacenamiento encontrado
   * @throws {BadRequestException} Si el tipo de almacenamiento no existe
   */
  async findById(id: string): Promise<TypeStorage> {
    const typeStorage = await this.typeStorageRepository.findById(id);
    if (!typeStorage) {
      throw new BadRequestException('Tipo de almacenamiento no encontrado');
    }
    return typeStorage;
  }

  /**
   * Desactiva múltiples tipos de almacenamiento
   * @param deleteTypeStorageDto - DTO con los IDs de los tipos de almacenamiento a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de almacenamiento desactivados
   * @throws {NotFoundException} Si algún tipo de almacenamiento no existe
   */
  async deleteMany(
    deleteTypeStorageDto: DeleteTypeStorageDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeStorage[]>> {
    try {
      validateArray(deleteTypeStorageDto.ids, 'IDs de tipos de almacenamiento');
      return await this.deleteTypeStorageUseCase.execute(
        deleteTypeStorageDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples tipos de almacenamiento
   * @param ids - Lista de IDs de los tipos de almacenamiento a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de almacenamiento reactivados
   * @throws {NotFoundException} Si algún tipo de almacenamiento no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<TypeStorage[]>> {
    try {
      validateArray(ids, 'IDs de tipos de almacenamiento');
      return await this.reactivateTypeStorageUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Verifica si existe un tipo de almacenamiento con el nombre especificado
   * @param name - Nombre a buscar
   * @returns true si existe el tipo de almacenamiento, false si no existe
   */
  async findByName(name: string): Promise<boolean> {
    const result = await this.typeStorageRepository.findByField('name', name);
    return result && result.length > 0 ? true : false;
  }
}
