import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AppointmentTypeRepository } from '../repositories/appointment-type.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AppointmentType } from '../entities/appointment-type.entity';
import {
  CreateAppointmentTypeDto,
  DeleteAppointmentTypesDto,
  UpdateAppointmentTypeDto,
} from '../dto';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import {
  CreateAppointmentTypeUseCase,
  UpdateAppointmentTypeUseCase,
} from '../use-cases';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { DeleteAppointmentTypesUseCase } from '../use-cases/delete-appointment-type.use-case';
import { serviceTypeErrorMessages } from 'src/modules/services/errors/errors-service-type';

/**
 * Servicio que implementa la lógica de negocio para tipos de citas médicas.
 * Utiliza AppointmentTypeRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 *
 * @remarks
 * Este servicio maneja las operaciones CRUD sobre tipos de citas médicas y utiliza
 * casos de uso específicos para cada operación principal.
 */
@Injectable()
export class AppointmentTypeService {
  private readonly logger = new Logger(AppointmentTypeService.name);
  private readonly errorHandler: BaseErrorHandler;
  constructor(
    private readonly appointmentTypeRepository: AppointmentTypeRepository,
    private readonly createAppointmentTypeUseCase: CreateAppointmentTypeUseCase,
    private readonly updateAppointmentTypeUseCase: UpdateAppointmentTypeUseCase,
    private readonly deleteAppointmentTypesUseCase: DeleteAppointmentTypesUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Tipo de Cita',
      serviceTypeErrorMessages,
    );
  }

  /**
   * Crea un nuevo tipo de cita médica
   * @param createAppointmentTypeDto - DTO con los datos del tipo de cita a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el tipo de cita creado
   * @throws {BadRequestException} Si el tipo de cita ya existe
   */
  async create(
    createAppointmentTypeDto: CreateAppointmentTypeDto,
    user: UserData,
  ): Promise<HttpResponse<AppointmentType>> {
    try {
      return await this.createAppointmentTypeUseCase.execute(
        createAppointmentTypeDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un tipo de cita existente
   * @param id - ID del tipo de cita a actualizar
   * @param updateAppointmentTypeDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el tipo de cita actualizado
   * @throws {NotFoundException} Si el tipo de cita no existe
   */
  async update(
    id: string,
    updateAppointmentTypeDto: UpdateAppointmentTypeDto,
    user: UserData,
  ): Promise<HttpResponse<AppointmentType>> {
    try {
      const currentType = await this.findById(id);
      if (!validateChanges(updateAppointmentTypeDto, currentType)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en tipo de cita',
          data: currentType,
        };
      }

      return await this.updateAppointmentTypeUseCase.execute(
        id,
        updateAppointmentTypeDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Obtiene todos los tipos de citas
   * @returns Lista de todos los tipos de citas
   */
  async findAll(): Promise<AppointmentType[]> {
    try {
      return this.appointmentTypeRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un tipo de cita por su ID
   * @param id - ID del tipo de cita a buscar
   * @returns El tipo de cita encontrado
   * @throws {NotFoundException} Si el tipo de cita no existe
   */
  async findOne(id: string): Promise<AppointmentType> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Desactiva múltiples tipos de citas
   * @param deleteAppointmentTypesDto - DTO con los IDs de los tipos de citas a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de citas desactivados
   */
  async deleteMany(
    deleteAppointmentTypesDto: DeleteAppointmentTypesDto,
    user: UserData,
  ): Promise<HttpResponse<AppointmentType[]>> {
    try {
      validateArray(deleteAppointmentTypesDto.ids, 'IDs de tipos de cita');
      return await this.deleteAppointmentTypesUseCase.execute(
        deleteAppointmentTypesDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Busca un tipo de cita por su ID (método interno)
   * @param id - ID del tipo de cita a buscar
   * @returns El tipo de cita encontrado
   * @throws {BadRequestException} Si el tipo de cita no existe
   * @internal
   */
  async findById(id: string): Promise<AppointmentType> {
    const appointmentType = await this.appointmentTypeRepository.findById(id);
    if (!appointmentType) {
      throw new BadRequestException('Tipo de cita no encontrado');
    }
    return appointmentType;
  }
}
