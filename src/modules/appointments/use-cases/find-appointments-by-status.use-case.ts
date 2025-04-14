import { Injectable, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '@prisma/client';
import { UserBranchData } from '@login/login/interfaces';

@Injectable()
export class FindAppointmentsByStatusUseCase {
  private readonly logger = new Logger(FindAppointmentsByStatusUseCase.name);

  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  /**
   * Busca citas médicas por estado o todas las citas si no se especifica un estado
   * @param status Estado opcional para filtrar citas (undefined = todas)
   * @param page Número de página
   * @param limit Número de registros por página
   * @param userBranch Datos del usuario y su sucursal para aplicar filtros
   * @returns Lista paginada de citas médicas según filtro
   */
  async execute(
    status?: AppointmentStatus,
    page: number = 1,
    limit: number = 10,
    userBranch?: UserBranchData,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    // Validar y asegurar que page y limit sean números válidos
    const pageNum = page && !isNaN(Number(page)) ? Number(page) : 1;
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 10;

    // Aplicar filtro de sucursal según el rol del usuario
    const branchFilter = this.createBranchFilter(userBranch);

    // Combinar el filtro de estado con el filtro de sucursal
    const filter = {
      ...(status ? { status } : {}),
      isActive: true,
      ...branchFilter,
    };

    this.logger.debug(
      `Buscando citas${status ? ` con estado ${status}` : ' (TODAS LAS CITAS)'},` +
        ` página ${pageNum}, límite ${limitNum}, filtro: ${JSON.stringify(filter)}`,
    );

    const result = await this.appointmentRepository.findManyWithFilter(
      filter,
      pageNum,
      limitNum,
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
