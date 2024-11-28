import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateServiceDto, UpdateServiceDto } from '../dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { CreateServiceUseCase } from '../use-cases/create-service.use-case';
import { UpdateServiceUseCase } from '../use-cases/update-service.use-case';
import { handleException } from '@login/login/utils';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { ServiceRepository } from '../repositories/service.repository';
import { DeleteServiceUseCase } from '../use-cases/delete-service.use-case';
import { DeleteServicesDto } from '../dto/delete-services.dto';
import { DeleteServicesUseCase } from '../use-cases/delete-services.use-case';

/**
 * Servicio que implementa la lógica de negocio para servicios médicos.
 * Utiliza ServiceRepository para acceder a la base de datos.
 *
 * @class
 */
@Injectable()
export class ServiceService {
  private readonly logger = new Logger(ServiceService.name);
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
    private readonly deleteServicesUseCase: DeleteServicesUseCase,
  ) {}

  /**
   * Crea un nuevo servicio.
   * @param {CreateServiceDto} createServiceDto - Datos para crear el servicio.
   * @param {UserData} user - Datos del usuario que crea el servicio.
   * @returns {Promise<HttpResponse<Service>>} - Respuesta HTTP con el servicio creado.
   * @throws {BadRequestException} - Si el tipo de servicio no existe.
   * @throws {Error} - Si ocurre un error al crear el servicio.
   */
  async create(
    createServiceDto: CreateServiceDto,
    user: UserData,
  ): Promise<HttpResponse<Service>> {
    try {
      return await this.createServiceUseCase.execute(createServiceDto, user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error creating Service: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error creating Service: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error creando Servicio');
      }
    }
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    user: UserData,
  ): Promise<HttpResponse<Service>> {
    try {
      // Obtener el servicio existente
      const currentService = await this.serviceRepository.findById(id);

      // Validar si hay cambios significativos
      if (!validateChanges(updateServiceDto, currentService)) {
        this.logger.log('No significant changes, omitting update');
        return {
          statusCode: HttpStatus.OK,
          message: 'Service actualizado correctamente',
          data: currentService,
        };
      }
      return await this.updateServiceUseCase.execute(
        id,
        updateServiceDto,
        user,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error updating Service: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error updating Service: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error actualizando Servicio');
      }
    }
  }

  async findOne(id: string): Promise<Service> {
    try {
      return this.findById(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error geting Service: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error geting Service: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error obteniendo Service');
      }
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      return this.serviceRepository.findMany();
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error geting Service: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error geting Service: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error obteniendo Service');
      }
    }
  }

  /**
   * Elimina (softdelete) un servicio.
   * @param {string} id - ID del servicio a eliminar.
   * @param {UserData} user - Datos del usuario que realiza la eliminación.
   * @returns {Promise<HttpResponse<Service>>} - Respuesta HTTP con el servicio eliminado.
   */
  async delete(id: string, user: UserData): Promise<HttpResponse<Service>> {
    try {
      return await this.deleteServiceUseCase.execute(id, user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error deleting Service: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error deleting Service: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error deleting Service');
      }
    }
  }

  /**
   * Elimina (softdelete) múltiples servicios.
   * @param {DeleteServicesDto} deleteServicesDto - DTO con los IDs de los servicios a eliminar.
   * @param {UserData} user - Datos del usuario que realiza la eliminación.
   * @returns {Promise<HttpResponse<Service[]>>} - Respuesta HTTP con los servicios eliminados.
   */
  async deleteMany(
    deleteServicesDto: DeleteServicesDto,
    user: UserData,
  ): Promise<HttpResponse<Service[]>> {
    try {
      // Validar el array de IDs
      validateArray(deleteServicesDto.ids, 'IDs de servicios');

      return await this.deleteServicesUseCase.execute(deleteServicesDto, user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.logger.warn(`Error deleting multiple services: ${error.message}`);
        throw error;
      } else {
        this.logger.error(
          `Error deleting multiple services: ${error.message}`,
          error.stack,
        );
        handleException(error, 'Error eliminando múltiples servicios');
      }
    }
  }
  async findById(id: string): Promise<Service> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new BadRequestException(`Servicio no encontrado`);
    }
    return service;
  }
}
