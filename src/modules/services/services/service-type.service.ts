import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { ServiceType } from '../entities/service.entity';
import { handleException } from '@login/login/utils';
import { CreateServiceTypeUseCase } from '../use-cases/create-servicetype.use-case';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { UpdateServiceTypeUseCase } from '../use-cases/update-servicetype.use-case';
import { DeleteServiceTypesUseCase } from '../use-cases/delete-servicetype.use-case';
import { ReactivateServiceTypesUseCase } from '../use-cases/reactive-servicetype.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';

import {
  CreateServiceTypeDto,
  UpdateServiceTypeDto,
  DeleteServiceTypesDto,
} from '../dto';
import { serviceTypeErrorMessages } from '../errors/errors-service-type';

/**
 * Servicio que implementa la lógica de negocio para tipos de servicios médicos.
 * Utiliza ServiceTypeRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 *
 * @remarks
 * Este servicio maneja las operaciones CRUD sobre tipos de servicios médicos y
 * proporciona funcionalidades para gestionar categorías o tipos de servicios en el sistema.
 */
@Injectable()
export class ServiceTypeService {
  private readonly logger = new Logger(ServiceTypeService.name);
  private readonly errorHandler: BaseErrorHandler;
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly createServiceTypeUseCase: CreateServiceTypeUseCase,
    private readonly updateServiceTypeUseCase: UpdateServiceTypeUseCase,
    private readonly deleteServiceTypesUseCase: DeleteServiceTypesUseCase,
    private readonly reactivateServiceTypesUseCase: ReactivateServiceTypesUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'ServiceType',
      serviceTypeErrorMessages,
    );
  }

  /**
   * Crea un nuevo tipo de servicio médico
   * @param createServiceTypeDto - DTO con los datos del tipo de servicio a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el tipo de servicio creado
   * @throws {BadRequestException} Si el tipo de servicio ya existe
   * @throws {ConflictException} Si hay conflicto al crear el tipo de servicio
   */
  async create(
    createServiceTypeDto: CreateServiceTypeDto,
    user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    try {
      return await this.createServiceTypeUseCase.execute(
        createServiceTypeDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un tipo de servicio existente
   * @param id - ID del tipo de servicio a actualizar
   * @param updateServiceTypeDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el tipo de servicio actualizado
   * @throws {NotFoundException} Si el tipo de servicio no existe
   * @throws {BadRequestException} Si los datos de actualización son inválidos
   */
  async update(
    id: string,
    updateServiceTypeDto: UpdateServiceTypeDto,
    user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    try {
      // Obtener el tipo de servicio existente
      const currentServiceType = await this.findById(id);

      // Validar si hay cambios significativos
      if (!validateChanges(updateServiceTypeDto, currentServiceType)) {
        this.logger.log('No significant changes, omitting update');
        return {
          statusCode: HttpStatus.OK,
          message: 'Service actualizado correctamente',
          data: currentServiceType,
        };
      }
      return await this.updateServiceTypeUseCase.execute(
        id,
        updateServiceTypeDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un tipo de servicio por su ID
   * @param id - ID del tipo de servicio a buscar
   * @returns El tipo de servicio encontrado
   * @throws {NotFoundException} Si el tipo de servicio no existe
   */
  async findOne(id: string): Promise<ServiceType> {
    try {
      return this.findById(id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        this.logger.warn(`Error geting ServiceType: ${error.message}`);
        throw error;
      }
      handleException(error, 'Error obteniendo tipo de servicio');
    }
  }

  /**
   * Obtiene todos los tipos de servicios
   * @returns Lista de todos los tipos de servicios
   */
  async findAll(): Promise<ServiceType[]> {
    try {
      return this.serviceTypeRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  // /**
  //  * Elimina (softdelete) un servicio.
  //  * @param {string} id - ID del servicio a eliminar.
  //  * @param {UserData} user - Datos del usuario que realiza la eliminación.
  //  * @returns {Promise<HttpResponse<ServiceType>>} - Respuesta HTTP con el servicio eliminado.
  //  */
  // async delete(id: string, user: UserData): Promise<HttpResponse<ServiceType>> {
  //   try {
  //     return await this.deleteServiceTypeUseCase.execute(id, user);
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'deactivating');
  //   }
  // }

  /**
   * Desactiva múltiples tipos de servicios
   * @param deleteServiceTypesDto - DTO con los IDs de los tipos de servicios a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de servicios desactivados
   * @throws {NotFoundException} Si algún tipo de servicio no existe
   * @throws {BadRequestException} Si hay tipos de servicios en uso que no pueden ser desactivados
   */
  async deleteMany(
    deleteServiceTypesDto: DeleteServiceTypesDto,
    user: UserData,
  ): Promise<HttpResponse<ServiceType[]>> {
    try {
      // Validar el array de IDs
      validateArray(deleteServiceTypesDto.ids, 'IDs de servicios');

      return await this.deleteServiceTypesUseCase.execute(
        deleteServiceTypesDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }
  //
  // /**
  //  * Reactiva un tipo de servicio previamente desactivado.
  //  * @param {string} id - ID del tipo de servicio a reactivar.
  //  * @param {UserData} user - Datos del usuario que realiza la reactivación.
  //  * @returns {Promise<HttpResponse<ServiceType>>} - Respuesta HTTP con el tipo de servicio reactivado.
  //  */
  // async reactivate(
  //   id: string,
  //   user: UserData,
  // ): Promise<HttpResponse<ServiceType>> {
  //   try {
  //     return await this.reactivateServiceTypeUseCase.execute(id, user);
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       this.logger.warn(`Error reactivating ServiceType: ${error.message}`);
  //       throw error;
  //     } else {
  //       this.logger.error(
  //         `Error reactivating ServiceType: ${error.message}`,
  //         error.stack,
  //       );
  //       handleException(error, 'Error reactivating ServiceType');
  //     }
  //   }
  // }

  /**
   * Reactiva múltiples tipos de servicios
   * @param ids - Lista de IDs de los tipos de servicios a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de servicios reactivados
   * @throws {NotFoundException} Si algún tipo de servicio no existe
   * @throws {BadRequestException} Si hay algún problema al reactivar los tipos de servicios
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<ServiceType[]>> {
    try {
      // Validar el array de IDs
      validateArray(ids, 'IDs de tipos de servicio');

      return await this.reactivateServiceTypesUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Busca un tipo de servicio por su ID (método interno)
   * @param id - ID del tipo de servicio a buscar
   * @returns El tipo de servicio encontrado
   * @throws {BadRequestException} Si el tipo de servicio no existe
   * @internal
   */
  async findById(id: string): Promise<ServiceType> {
    const serviceType = await this.serviceTypeRepository.findById(id);
    if (!serviceType) {
      throw new BadRequestException(`Tipo de servicio no encontrado`);
    }
    return serviceType;
  }
}
