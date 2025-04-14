import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  HttpResponse,
  UserData,
  UserBranchData,
} from '@login/login/interfaces';
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
  CancelAppointmentUseCase,
  NoShowAppointmentUseCase,
  RefundAppointmentUseCase,
  RescheduleAppointmentUseCase,
  FindAppointmentsByStatusUseCase,
} from '../use-cases';
import { DeleteAppointmentsDto } from '../dto/delete-appointments.dto';
import { ServiceService } from 'src/modules/services/services/service.service';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { NoShowAppointmentDto } from '../dto/no-show-appointment.dto';
import { RefundAppointmentDto } from '../dto/refund-appointment.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { AppointmentStatus } from '@prisma/client';

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
    private readonly findAppointmentsByStatusUseCase: FindAppointmentsByStatusUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    private readonly noShowAppointmentUseCase: NoShowAppointmentUseCase,
    private readonly refundAppointmentUseCase: RefundAppointmentUseCase,
    private readonly rescheduleAppointmentUseCase: RescheduleAppointmentUseCase,
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

  /* 
  //usuario logeado SuperAdmin
  ~ AppointmentService ~ userBranch: {
    id: '6d7c4e62-68b2-446e-8859-55cfc7c94301',
    isSuperAdmin: true,
    rol: 'SUPER_ADMIN',
    staffId: null,
    branchId: null
  }

    //usuario logeado ADMINISTRATIVO / MEDICO
  ~ AppointmentService ~ userBranch: {
  id: '8995a857-c3d1-4254-af10-b6950dfb9c83',
  isSuperAdmin: false,
  rol: 'ADMINISTRATIVO',
  staffId: '21476c22-e1a3-48a5-b203-8a5f97f900f0',
  branchId: 'da51497f-63a5-47f5-a0ae-f75cc94af50a'
}
  //TABLA DE REGISTROS
  model Appointment {
  id                 String            @id @default(uuid())
  branchId           String
  etc ...
}
  */

  /**
   * Obtiene todas las citas médicas
   */
  async findAll(
    startDate?: Date,
    endDate?: Date,
    userBranch?: UserBranchData,
  ): Promise<Appointment[]> {
    console.log('🚀 ~ AppointmentService ~ userBranch:', userBranch);
    this.logger.log(
      `findAll called with startDate: ${startDate}, endDate: ${endDate}`,
    );
    try {
      // Crear el filtro base dependiendo del tipo de usuario
      const branchFilter = this.createBranchFilter(userBranch);

      if (startDate && endDate) {
        const appointments = await this.appointmentRepository.findByDateRange(
          startDate,
          endDate,
          branchFilter,
        );
        this.logger.log(`Appointments found: ${appointments.length}`);
        return appointments;
      }

      // Aplicar el mismo filtro para todas las consultas
      const allAppointments = await this.appointmentRepository.findMany({
        where: {
          isActive: true,
          ...branchFilter,
        },
        orderBy: {
          start: 'desc',
        },
      });

      this.logger.log(`All appointments found: ${allAppointments.length}`);
      return allAppointments;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Crea un filtro de sucursal basado en los datos del usuario
   * @param userBranch - Datos del usuario y su sucursal
   * @returns Filtro para usar en consultas Prisma
   */
  private createBranchFilter(userBranch?: UserBranchData): any {
    // Si no hay datos de usuario o es SuperAdmin, no aplicar filtro por sucursal
    if (
      !userBranch ||
      userBranch.isSuperAdmin ||
      userBranch.rol === 'SUPER_ADMIN' ||
      userBranch.rol === 'MEDICO'
    ) {
      return {};
    }

    // Si es un usuario administrativo, filtrar por su sucursal
    if (userBranch.rol === 'ADMINISTRATIVO' && userBranch.branchId) {
      return { branchId: userBranch.branchId };
    }

    return {};
  }

  /**
   * Obtiene todas las citas médicas de forma paginada
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    userBranch?: UserBranchData,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    try {
      return await this.findAppointmentsPaginatedUseCase.execute(
        page,
        limit,
        userBranch,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca citas médicas por estado de forma paginada
   * @param status Estado de las citas a buscar (opcional). Usar undefined para obtener TODAS las citas
   * @param page Número de página
   * @param limit Límite de registros por página
   * @returns Lista paginada de citas médicas que coinciden con el estado especificado o TODAS las citas si no se especifica
   */
  async findByStatus(
    status?: AppointmentStatus,
    page: number = 1,
    limit: number = 10,
    userBranch?: UserBranchData,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    this.logger.log(
      `findByStatus called with status: ${status || 'TODAS LAS CITAS'}, page: ${page}, limit: ${limit}`,
    );
    try {
      return await this.findAppointmentsByStatusUseCase.execute(
        status,
        page,
        limit,
        userBranch,
      );
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
      const appointments =
        await this.appointmentRepository.findByPatient(pacienteId);
      this.logger.log(
        `Appointments found for patient ${pacienteId}: ${JSON.stringify(appointments)}`,
      );
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
      const appointments =
        await this.appointmentRepository.findByStaff(personalId);
      this.logger.log(
        `Appointments found for staff ${personalId}: ${JSON.stringify(appointments)}`,
      );
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
      return await this.reactivateAppointmentsUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Cancela una cita médica y sus órdenes asociadas
   * @param id - ID de la cita a cancelar
   * @param cancelAppointmentDto - DTO con los datos de cancelación
   * @param user - Datos del usuario que realiza la acción
   * @returns Respuesta con la cita cancelada
   * @throws {BadRequestException} Si hay un error al cancelar la cita
   */
  async cancel(
    id: string,
    cancelAppointmentDto: CancelAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      return await this.cancelAppointmentUseCase.execute(
        id,
        cancelAppointmentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Reembolsa una cita médica y actualiza sus órdenes y pagos asociados a REFUNDED
   * @param id - ID de la cita a reembolsar
   * @param refundAppointmentDto - DTO con los datos del reembolso
   * @param user - Datos del usuario que realiza la acción
   * @returns Respuesta con la cita reembolsada
   * @throws {BadRequestException} Si hay un error al reembolsar la cita
   */
  async refund(
    id: string,
    refundAppointmentDto: RefundAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      return await this.refundAppointmentUseCase.execute(
        id,
        refundAppointmentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
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
      throw new BadRequestException(
        `Cita médica con ID ${appointmentId} no encontrada`,
      );
    }

    const serviceId = appointment.serviceId;
    const service = await this.serviceService.findOne(serviceId);
    if (!service) {
      throw new BadRequestException(
        `Servicio con ID ${serviceId} no encontrado`,
      );
    }
    return service.price;
  }

  async getStaffByAppointmentId(appointmentId: string): Promise<string> {
    const appointment = await this.findById(appointmentId);

    if (!appointment) {
      throw new BadRequestException(
        `Cita médica con ID ${appointmentId} no encontrada`,
      );
    }

    const staffId = appointment.staffId;

    const staff = await this.serviceService.findOne(staffId);

    return staff.name;
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

  /**
   * Marca una cita médica como NO_SHOW (paciente no se presentó)
   * @param id - ID de la cita a marcar
   * @param noShowAppointmentDto - DTO con los datos de no presentación
   * @param user - Datos del usuario que realiza la acción
   * @returns Respuesta con la cita actualizada
   * @throws {BadRequestException} Si hay un error al marcar la cita
   */
  async markAsNoShow(
    id: string,
    noShowAppointmentDto: NoShowAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      return await this.noShowAppointmentUseCase.execute(
        id,
        noShowAppointmentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Reprograma una cita médica
   * @param id - ID de la cita a reprogramar
   * @param rescheduleAppointmentDto - DTO con los datos de reprogramación
   * @param user - Datos del usuario que realiza la acción
   * @returns Respuesta con la nueva cita reprogramada
   * @throws {BadRequestException} Si hay un error al reprogramar la cita
   */
  async reschedule(
    id: string,
    rescheduleAppointmentDto: RescheduleAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    try {
      return await this.rescheduleAppointmentUseCase.execute(
        id,
        rescheduleAppointmentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }
}
