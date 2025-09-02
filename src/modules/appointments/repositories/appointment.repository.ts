import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentRepository extends BaseRepository<Appointment> {
  constructor(prisma: PrismaService) {
    super(prisma, 'appointment');
  }

  /**
   * Busca citas médicas en un rango de fechas con paginación
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param page Número de página
   * @param limit Límite de registros por página
   * @param userBranch Información de la sucursal del usuario
   * @returns Objeto con citas paginadas y total de registros
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10,
    userBranch?: any,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Construir filtro de sucursal si existe
    const branchFilter = userBranch?.branchId
      ? { branchId: userBranch.branchId }
      : {};

    const whereCondition = {
      start: {
        gte: startDate,
        lte: endDate,
      },
      isActive: true,
      ...branchFilter,
    };

    const selectCondition = {
      id: true,
      eventId: true,
      staffId: true,
      serviceId: true,
      branchId: true,
      patientId: true,
      start: true,
      end: true,
      status: true,
      cancellationReason: true,
      isActive: true,
      rescheduledFromId: true,
      type: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      patient: {
        select: {
          id: true,
          name: true,
          lastName: true,
          dni: true,
        },
      },
      staff: {
        select: {
          id: true,
          name: true,
          lastName: true,
          userId: true,
          cmp: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    };

    // Ejecutar ambas consultas en paralelo
    const [appointments, totalResult] = await Promise.all([
      this.findMany({
        where: whereCondition,
        select: selectCondition,
        skip,
        take: limit,
        orderBy: { start: 'desc' },
      }),
      this.findMany({ where: whereCondition }),
    ]);

    return {
      appointments,
      total: totalResult.length,
    };
  }

  /**
   * Busca citas médicas en un rango de fechas (sin paginación)
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param branchFilter Filtro de sucursal
   * @returns Array de citas médicas
   */
  async findByDateRangeSimple(
    startDate: Date,
    endDate: Date,
    branchFilter: any = {},
  ): Promise<Appointment[]> {
    return this.findMany({
      where: {
        start: {
          gte: startDate,
          lte: endDate,
        },
        isActive: true,
        ...branchFilter,
      },
      select: {
        id: true,
        eventId: true,
        staffId: true,
        serviceId: true,
        branchId: true,
        patientId: true,
        start: true,
        end: true,
        status: true,
        cancellationReason: true,
        isActive: true,
        rescheduledFromId: true,
        type: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
            dni: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            lastName: true,
            userId: true,
            cmp: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByPatient(pacienteId: string): Promise<Appointment[]> {
    return this.findMany({
      where: {
        pacienteId,
        isActive: true,
      },
      include: {
        personal: true,
        tipoCita: true,
      },
    });
  }

  async findByStaff(personalId: string): Promise<Appointment[]> {
    return this.findMany({
      where: {
        personalId,
        isActive: true,
      },
      include: {
        paciente: true,
        tipoCita: true,
      },
    });
  }

  async findManyPaginated(
    page: number = 1,
    limit: number = 10,
    branchFilter: any = {}, // Agregar el parámetro para filtro de sucursal
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    // Aplicar el filtro de sucursal junto con el filtro base
    const whereClause = {
      isActive: true,
      ...branchFilter,
    };

    const [total, appointments] = await Promise.all([
      this.prisma.appointment.count({ where: whereClause }),
      this.prisma.appointment.findMany({
        where: whereClause,
        skip,
        take,
        select: {
          id: true,
          eventId: true,
          staffId: true,
          serviceId: true,
          branchId: true,
          patientId: true,
          start: true,
          end: true,
          paymentMethod: true,
          status: true,
          cancellationReason: true,
          isActive: true,
          rescheduledFromId: true,
          orderId: true,
          type: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          patient: {
            select: {
              id: true,
              name: true,
              lastName: true,
              dni: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
              lastName: true,
              userId: true,
              cmp: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { start: 'asc' }, // Ordenar por fecha de inicio
      }),
    ]);

    return { appointments, total };
  }

  async findManyWithFilter(
    filter: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    // El filtro ya incluye tanto el estado como el filtro de sucursal
    // No es necesario modificar este método si se pasa el filtro completo

    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    const [total, appointments] = await Promise.all([
      this.prisma.appointment.count({ where: filter }),
      this.prisma.appointment.findMany({
        where: filter,
        skip,
        take,
        select: {
          id: true,
          eventId: true,
          staffId: true,
          serviceId: true,
          branchId: true,
          patientId: true,
          start: true,
          end: true,
          paymentMethod: true,
          status: true,
          cancellationReason: true,
          isActive: true,
          rescheduledFromId: true,
          orderId: true,
          type: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          patient: {
            select: {
              id: true,
              name: true,
              lastName: true,
              dni: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
              lastName: true,
              userId: true,
              cmp: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { start: 'desc' },
      }),
    ]);

    return { appointments, total };
  }

  async findById(id: string, branchFilter: any = {}): Promise<Appointment> {
    return this.prisma.appointment.findFirst({
      where: {
        id,
        isActive: true,
        ...branchFilter, // Aplicar filtro de sucursal si existe
      },
      select: {
        id: true,
        eventId: true,
        staffId: true,
        serviceId: true,
        branchId: true,
        patientId: true,
        start: true,
        end: true,
        paymentMethod: true,
        status: true,
        cancellationReason: true,
        noShowReason: true,
        isActive: true,
        rescheduleReason: true,
        rescheduledFromId: true,
        orderId: true,
        type: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
            dni: true,
            phone: true,
            email: true,
          },
        },
        staff: {
          select: {
            id: true,
            name: true,
            lastName: true,
            userId: true,
            cmp: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        rescheduledFrom: {
          select: {
            id: true,
            start: true,
            end: true,
          },
        },
        order: {
          select: {
            id: true,
            code: true,
            total: true,
            status: true,
          },
        },
      },
    });
  }
}
