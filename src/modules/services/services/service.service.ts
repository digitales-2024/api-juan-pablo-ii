import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateServiceDto, DeleteServicesDto, UpdateServiceDto } from '../dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { ServiceRepository } from '../repositories/service.repository';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import {
  CreateServiceUseCase,
  UpdateServiceUseCase,
  DeleteServicesUseCase,
  ReactivateServicesUseCase,
} from '../use-cases';
import { serviceErrorMessages } from '../errors/errors-service';

/**
 * Servicio que implementa la lógica de negocio para servicios médicos.
 * Utiliza ServiceRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 *
 * @remarks
 * Este servicio maneja las operaciones CRUD sobre servicios médicos y utiliza
 * casos de uso específicos para cada operación principal.
 */

@Injectable()
export class ServiceService {
  private readonly logger = new Logger(ServiceService.name);
  private readonly errorHandler: BaseErrorHandler;
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServicesUseCase: DeleteServicesUseCase,
    private readonly reactivateServicesUseCase: ReactivateServicesUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Servicio',
      serviceErrorMessages,
    );
  }

  /**
   * Crea un nuevo servicio médico
   * @param createServiceDto - DTO con los datos del servicio a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el servicio creado
   * @throws {BadRequestException} Si el tipo de servicio no existe
   * @throws {ConflictException} Si el servicio ya existe
   */
  async create(
    createServiceDto: CreateServiceDto,
    user: UserData,
  ): Promise<HttpResponse<Service>> {
    try {
      return await this.createServiceUseCase.execute(createServiceDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un servicio existente
   * @param id - ID del servicio a actualizar
   * @param updateServiceDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el servicio actualizado
   * @throws {NotFoundException} Si el servicio no existe
   */
  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    user: UserData,
  ): Promise<HttpResponse<Service>> {
    try {
      // Obtener el servicio existente
      const currentService = await this.findById(id);

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
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un servicio por su ID
   * @param id - ID del servicio a buscar
   * @returns El servicio encontrado
   * @throws {NotFoundException} Si el servicio no existe
   */
  async findServiceById(id: string): Promise<Service> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los servicios
   * @returns Lista de todos los servicios
   */
  async findAll(): Promise<Service[]> {
    try {
      return this.serviceRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
  /**
   * Desactiva múltiples servicios
   * @param deleteServicesDto - DTO con los IDs de los servicios a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los servicios desactivados
   * @throws {NotFoundException} Si algún servicio no existe
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
      this.errorHandler.handleError(error, 'deactivating');
    }
  }
  /**
   * Reactiva múltiples servicios
   * @param ids - Lista de IDs de los servicios a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los servicios reactivados
   * @throws {NotFoundException} Si algún servicio no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Service[]>> {
    try {
      // Validar el array de IDs
      validateArray(ids, 'IDs de servicios');

      return await this.reactivateServicesUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Busca un servicio por su ID (método interno)
   * @param id - ID del servicio a buscar
   * @returns El servicio encontrado
   * @throws {BadRequestException} Si el servicio no existe
   * @internal
   */
  async findById(id: string): Promise<Service> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new BadRequestException(`Servicio no encontrado`);
    }
    return service;
  }

  async findOneWithDetails(id: string): Promise<Service> {
    try {
      return await this.serviceRepository.findOneWithDetails(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
