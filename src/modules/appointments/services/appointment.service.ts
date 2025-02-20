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
  DeleteAppointmentsUseCase,
  ReactivateAppointmentsUseCase,
  UpdateAppointmentUseCase,
} from '../use-cases';
import { DeleteAppointmentsDto } from '../dto/delete-appointments.dto';

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
      'Appointments',
      appointmentErrorMessages,
    );
  }

  /**
   * Crea una nueva cita médica
   */
  async create(
    createAppointmentDto: CreateAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      console.log('estoy en el service aqui no es', createAppointmentDto);
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
   */
  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      const currentAppointment = await this.findById(id);

      const dtoToCompare = {
        ...updateAppointmentDto,
        ...(updateAppointmentDto.date && {
          date: new Date(updateAppointmentDto.date),
        }),
      };

      if (!validateChanges(dtoToCompare, currentAppointment)) {
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
   * Obtiene todas las citas médicas
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
   */
  async findOne(id: string): Promise<Appointment> {
    try {
      return await this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca citas por paciente
   */
  async findByPatient(pacienteId: string): Promise<Appointment[]> {
    try {
      return await this.appointmentRepository.findByPatient(pacienteId);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca citas por personal médico
   */
  async findByStaff(personalId: string): Promise<Appointment[]> {
    try {
      return await this.appointmentRepository.findByStaff(personalId);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Elimina múltiples citas
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
   */
  private async findById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new BadRequestException('Cita médica no encontrada');
    }
    return appointment;
  }
}
