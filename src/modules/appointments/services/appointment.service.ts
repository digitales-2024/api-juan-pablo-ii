import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { appointmentErrorMessages } from '../errors/errors-appointments';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { Appointment } from '../entities/appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto';
import {
  CreateAppointmentUseCase,
  UpdateAppointmentUseCase,
} from '../use-cases';
import { DeleteAppointmentsDto } from '../dto/delete-appointments.dto';
import { DeleteAppointmentsUseCase } from '../use-cases/delete-appointments.use-case';
import { ReactivateAppointmentsUseCase } from '../use-cases/reactive-appointments.use-case';

/**
 * Servicio que implementa la lógica de negocio para citas médicas.
 * Utiliza AppointmentRepository para acceder a la base de datos y varios casos de uso
 * para implementar las operaciones principales.
 */
@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
    private readonly deleteAppointmentsUseCase: DeleteAppointmentsUseCase,
    private readonly reactivateAppointmentsUseCase: ReactivateAppointmentsUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Cita médica',
      appointmentErrorMessages,
    );
  }

  /**
   * Crea una nueva cita médica
   * @param createAppointmentDto - DTO con los datos de la cita a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la cita creada
   * @throws {BadRequestException} Si el horario no está disponible
   */
  async create(
    createAppointmentDto: CreateAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      return await this.createAppointmentUseCase.execute(
        createAppointmentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza una cita existente
   * @param id - ID de la cita a actualizar
   * @param updateAppointmentDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la cita actualizada
   * @throws {NotFoundException} Si la cita no existe
   */
  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      const currentAppointment = await this.findById(id);

      if (!validateChanges(updateAppointmentDto, currentAppointment)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en la cita médica',
          data: currentAppointment,
        };
      }

      return await this.updateAppointmentUseCase.execute(
        id,
        updateAppointmentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Obtiene todas las citas médicas, opcionalmente filtradas por rango de fechas
   * @param startDate - Fecha inicial opcional para filtrar
   * @param endDate - Fecha final opcional para filtrar
   * @returns Lista de todas las citas médicas
   */
  async findAll(startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    try {
      if (startDate && endDate) {
        return this.appointmentRepository.findByDateRange(startDate, endDate);
      }
      return this.appointmentRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una cita por su ID
   * @param id - ID de la cita a buscar
   * @returns La cita encontrada
   * @throws {NotFoundException} Si la cita no existe
   */
  async findOne(id: string): Promise<Appointment> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca citas por paciente
   * @param pacienteId - ID del paciente
   * @returns Lista de citas del paciente
   */
  async findByPatient(pacienteId: string): Promise<Appointment[]> {
    try {
      return this.appointmentRepository.findByPatient(pacienteId);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca citas por personal médico
   * @param personalId - ID del personal médico
   * @returns Lista de citas del personal médico
   */
  async findByStaff(personalId: string): Promise<Appointment[]> {
    try {
      return this.appointmentRepository.findByStaff(personalId);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Elimina múltiples citas
   * @param deleteAppointmentsDto - DTO con los IDs de las citas a eliminar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las citas eliminadas
   * @throws {NotFoundException} Si alguna cita no existe
   */
  async deleteMany(
    deleteAppointmentsDto: DeleteAppointmentsDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment[]>> {
    try {
      validateArray(deleteAppointmentsDto.ids, 'IDs de citas médicas');
      return await this.deleteAppointmentsUseCase.execute(
        deleteAppointmentsDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples citas
   * @param ids - Lista de IDs de las citas a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las citas reactivadas
   * @throws {NotFoundException} Si alguna cita no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Appointment[]>> {
    try {
      validateArray(ids, 'IDs de citas médicas');
      return await this.reactivateAppointmentsUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Busca una cita por su ID (método interno)
   * @param id - ID de la cita a buscar
   * @returns La cita encontrada
   * @throws {BadRequestException} Si la cita no existe
   * @internal
   */
  private async findById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new BadRequestException('Cita médica no encontrada');
    }
    return appointment;
  }
}
