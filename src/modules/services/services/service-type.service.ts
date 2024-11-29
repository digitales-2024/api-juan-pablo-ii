import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from '../dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { ServiceType } from '../entities/service.entity';
import { handleException } from '@login/login/utils';
import { CreateServiceTypeUseCase } from '../use-cases/create-servicetype.use-case';
import { validateChanges } from '@prisma/prisma/utils';
import { UpdateServiceTypeUseCase } from '../use-cases/update-servicetype.use-case';
import { DeleteServiceTypeUseCase } from '../use-cases/delete-servicetype.use-case';

/**
 * Servicio que implementa la lógica de negocio para tipos de servicios médicos.
 * Utiliza ServiceTypeRepository para acceder a la base de datos.
 *
 * @class
 */
@Injectable()
export class ServiceTypeService {
  private readonly logger = new Logger(ServiceTypeService.name);
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly createServiceTypeUseCase: CreateServiceTypeUseCase,
    private readonly updateServiceTypeUseCase: UpdateServiceTypeUseCase,
    private readonly deleteServiceTypeUseCase: DeleteServiceTypeUseCase,
  ) {}

  /**
   * Crea un nuevo tipo de servicio.
   * @param {CreateServiceTypeDto} createServiceTypeDto - Datos para crear el tipo de servicio.
   * @param {UserData} user - Datos del usuario que crea el tipo de servicio.
   * @returns {Promise<HttpResponse<ServiceType>>} - Respuesta HTTP con el tipo de servicio creado.
   * @throws {BadRequestException} - Si el tipo de servicio ya existe.
   * @throws {Error} - Si ocurre un error al crear el tipo de servicio.
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
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error creating ServiceType: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error creating ServiceType: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error creaando el tipo de servicio');
      }
    }
  }

  async update(
    id: string,
    updateServiceTypeDto: UpdateServiceTypeDto,
    user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    try {
      // Obtener el tipo de servicio existente
      const currentServiceType = await this.serviceTypeRepository.findById(id);

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
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error updating ServiceType: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error updating ServiceType: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error actualizando tipo de servicio');
      }
    }
  }

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

  async findAll(): Promise<ServiceType[]> {
    try {
      return this.serviceTypeRepository.findMany();
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
   * Elimina (softdelete) un servicio.
   * @param {string} id - ID del servicio a eliminar.
   * @param {UserData} user - Datos del usuario que realiza la eliminación.
   * @returns {Promise<HttpResponse<ServiceType>>} - Respuesta HTTP con el servicio eliminado.
   */
  async delete(id: string, user: UserData): Promise<HttpResponse<ServiceType>> {
    try {
      return await this.deleteServiceTypeUseCase.execute(id, user);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        this.logger.warn(`Error deleting ServiceType: ${error.message}`);
        throw error;
      }
      // Para errores inesperados, usar handleException
      handleException(error, 'Error borrando tipo de servicio');
    }
  }

  // /**
  //  * Elimina (softdelete) múltiples servicios.
  //  * @param {DeleteServicesDto} deleteServicesDto - DTO con los IDs de los servicios a eliminar.
  //  * @param {UserData} user - Datos del usuario que realiza la eliminación.
  //  * @returns {Promise<HttpResponse<Service[]>>} - Respuesta HTTP con los servicios eliminados.
  //  */
  // async deleteMany(
  //   deleteServicesDto: DeleteServicesDto,
  //   user: UserData,
  // ): Promise<HttpResponse<Service[]>> {
  //   try {
  //     // Validar el array de IDs
  //     validateArray(deleteServicesDto.ids, 'IDs de servicios');
  //
  //     return await this.deleteServicesUseCase.execute(deleteServicesDto, user);
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       this.logger.warn(`Error deleting multiple services: ${error.message}`);
  //       throw error;
  //     } else {
  //       this.logger.error(
  //         `Error deleting multiple services: ${error.message}`,
  //         error.stack,
  //       );
  //       handleException(error, 'Error eliminando múltiples servicios');
  //     }
  //   }
  // }
  //
  async findById(id: string): Promise<ServiceType> {
    const serviceType = await this.serviceTypeRepository.findById(id);
    if (!serviceType) {
      throw new BadRequestException(`Tipo de servicio no encontrado`);
    }
    return serviceType;
  }
}
