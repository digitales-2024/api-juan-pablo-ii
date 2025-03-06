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
  FindAppointmentsPaginatedUseCase,
} from '../use-cases';
import { DeleteAppointmentsDto } from '../dto/delete-appointments.dto';
import { ServiceService } from 'src/modules/services/services/service.service';

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
    private readonly findAppointmentsPaginatedUseCase: FindAppointmentsPaginatedUseCase,
    private readonly serviceService: ServiceService,
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
        ...(updateAppointmentDto.start && {
          start: new Date(updateAppointmentDto.start),
        }),
        ...(updateAppointmentDto.end && {
          end: new Date(updateAppointmentDto.end),
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
    this.logger.log(`findAll called with startDate: ${startDate}, endDate: ${endDate}`);
    try {
      if (startDate && endDate) {
        const appointments = await this.appointmentRepository.findByDateRange(startDate, endDate);
        this.logger.log(`Appointments found: ${JSON.stringify(appointments)}`);
        return appointments;
      }
      const allAppointments = await this.appointmentRepository.findMany();
      this.logger.log(`All appointments found: ${JSON.stringify(allAppointments)}`);
      return allAppointments;
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
    this.logger.log(`findByPatient called with pacienteId: ${pacienteId}`);
    try {
      const appointments = await this.appointmentRepository.findByPatient(pacienteId);
      this.logger.log(`Appointments found for patient ${pacienteId}: ${JSON.stringify(appointments)}`);
      return appointments;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca citas por personal médico
   */
  async findByStaff(personalId: string): Promise<Appointment[]> {
    this.logger.log(`findByStaff called with personalId: ${personalId}`);
    try {
      const appointments = await this.appointmentRepository.findByStaff(personalId);
      this.logger.log(`Appointments found for staff ${personalId}: ${JSON.stringify(appointments)}`);
      return appointments;
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
  * Obtiene todas las citas médicas de forma paginada
  */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<{ appointments: Appointment[]; total: number }> {
    try {
      return await this.findAppointmentsPaginatedUseCase.execute(page, limit);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }





  /**
   * Obtiene el precio del servicio asociado a una cita médica.
   * @param appointmentId - ID de la cita médica
   * @returns El precio del servicio
   * @throws {BadRequestException} Si la cita médica o el servicio no se encuentran
   */
  async getServicePriceByAppointmentId(appointmentId: string): Promise<number> {
    const appointment = await this.findById(appointmentId);
    if (!appointment) {
      throw new BadRequestException(`Cita médica con ID ${appointmentId} no encontrada`);
    }

    const serviceId = appointment.serviceId;
    const service = await this.serviceService.findOne(serviceId);
    if (!service) {
      throw new BadRequestException(`Servicio con ID ${serviceId} no encontrado`);
    }
    return service.price;
  }



  async getStaffByAppointmentId(appointmentId: string): Promise<string> {
    const appointment = await this.findById(appointmentId);

    if (!appointment) {
      throw new BadRequestException(`Cita médica con ID ${appointmentId} no encontrada`);
    }

    const staffId = appointment.staffId

    const staff = await this.serviceService.findOne(staffId);




    return staff.name
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
