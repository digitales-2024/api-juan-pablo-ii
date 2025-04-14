import { Injectable, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { UserBranchData } from '@login/login/interfaces';

@Injectable()
export class FindAppointmentsPaginatedUseCase {
  private readonly logger = new Logger(FindAppointmentsPaginatedUseCase.name);

  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    page: number,
    limit: number,
    userBranch?: UserBranchData,
  ): Promise<{ appointments: any[]; total: number }> {
    // Aplicar filtro de sucursal según el rol del usuario
    const branchFilter = this.createBranchFilter(userBranch);

    // Log del filtro aplicado
    this.logger.debug(
      `Aplicando filtro por sucursal: ${JSON.stringify(branchFilter)}`,
    );

    const result = await this.appointmentRepository.findManyPaginated(
      page,
      Math.min(limit, 50),
      branchFilter,
    );

    return {
      appointments: result.appointments.map((appointment) => ({
        ...appointment,
        patient: {
          name: appointment.patient?.name || 'No asignado',
          lastName: appointment.patient?.lastName || '',
          dni: appointment.patient?.dni || '',
        },
        staff: {
          name: appointment.staff?.name || 'No asignado',
          lastName: appointment.staff?.lastName || '',
        },
        service: {
          name: appointment.service?.name || 'Servicio no especificado',
        },
        branch: {
          name: appointment.branch?.name || 'Sucursal no especificada',
        },
      })),
      total: result.total,
    };
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
}
