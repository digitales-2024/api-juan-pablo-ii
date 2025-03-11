import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApponitmentUserRepository } from '../repositories/apponitment-user.repository';
import { AppointmentResponse } from '../entities/apponitment-user..entity';
import { UserData } from '@login/login/interfaces';
import { UpdateApponitmentUserUseCase } from '../use-cases';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { UpdateAppointmentUserDto } from '../dto/update-apponitment-user.dto';

@Injectable()
export class ApponitmentUserService {
  private readonly logger = new Logger(ApponitmentUserService.name);

  constructor(
    private readonly apponitmentUserRepository: ApponitmentUserRepository,
    private readonly updateApponitmentUserUseCase: UpdateApponitmentUserUseCase,
  ) {}

  /**
   * Obtener citas confirmadas para un médico específico
   * @param userId ID del usuario médico
   * @returns Lista de citas confirmadas
   */
  async getConfirmedForDoctor(userId: string): Promise<AppointmentResponse[]> {
    if (!userId) {
      throw new BadRequestException('ID de usuario requerido');
    }

    try {
      return await this.apponitmentUserRepository.getConfirmedAppointmentsByUserId(
        userId,
      );
    } catch (error) {
      this.logger.error(
        `Error obteniendo citas confirmadas para médico ${userId}: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Obtener citas completadas para un médico específico
   * @param userId ID del usuario médico
   * @returns Lista de citas completadas
   */
  async getCompletedForDoctor(userId: string): Promise<AppointmentResponse[]> {
    if (!userId) {
      throw new BadRequestException('ID de usuario requerido');
    }

    try {
      return await this.apponitmentUserRepository.getCompletedAppointmentsByUserId(
        userId,
      );
    } catch (error) {
      this.logger.error(
        `Error obteniendo citas completadas para médico ${userId}: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Obtener todas las citas confirmadas (admin)
   * @returns Lista de todas las citas confirmadas
   */
  async getAllConfirmed(): Promise<AppointmentResponse[]> {
    try {
      return await this.apponitmentUserRepository.getAllConfirmedAppointmentsAdmin();
    } catch (error) {
      this.logger.error(
        `Error obteniendo todas las citas confirmadas: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Obtener todas las citas completadas (admin)
   * @returns Lista de todas las citas completadas
   */
  async getAllCompleted(): Promise<AppointmentResponse[]> {
    try {
      return await this.apponitmentUserRepository.getAllCompletedAppointmentsAdmin();
    } catch (error) {
      this.logger.error(
        `Error obteniendo todas las citas completadas: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Obtener citas confirmadas por sucursal de un usuario específico
   * @param userId ID del usuario de mesón
   * @returns Lista de citas confirmadas de la sucursal
   */
  async getBranchConfirmed(userId: string): Promise<AppointmentResponse[]> {
    if (!userId) {
      throw new BadRequestException('ID de usuario requerido');
    }

    try {
      return await this.apponitmentUserRepository.getBranchConfirmedAppointmentsByUserId(
        userId,
      );
    } catch (error) {
      this.logger.error(
        `Error obteniendo citas confirmadas para la sucursal del usuario ${userId}: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Obtener citas completadas por sucursal de un usuario específico
   * @param userId ID del usuario de mesón
   * @returns Lista de citas completadas de la sucursal
   */
  async getBranchCompleted(userId: string): Promise<AppointmentResponse[]> {
    if (!userId) {
      throw new BadRequestException('ID de usuario requerido');
    }

    try {
      return await this.apponitmentUserRepository.getBranchCompletedAppointmentsByUserId(
        userId,
      );
    } catch (error) {
      this.logger.error(
        `Error obteniendo citas completadas para la sucursal del usuario ${userId}: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Actualiza el estado de una cita existente
   * @param appointmentId ID de la cita a actualizar
   * @param updateDto Datos para la actualización
   * @param user Datos del usuario que realiza la actualización
   * @returns Respuesta con la cita actualizada
   */
  async updateStatus(
    appointmentId: string,
    updateDto: UpdateAppointmentUserDto,
    user: UserData,
  ): Promise<BaseApiResponse<AppointmentResponse>> {
    if (!appointmentId) {
      throw new BadRequestException('ID de cita requerido');
    }

    try {
      return await this.updateApponitmentUserUseCase.execute(
        appointmentId,
        updateDto,
        user,
      );
    } catch (error) {
      this.logger.error(
        `Error actualizando estado de cita ${appointmentId}: ${error.message}`,
      );
      throw new BadRequestException(error.message);
    }
  }
}
