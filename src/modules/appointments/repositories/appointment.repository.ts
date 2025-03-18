import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentRepository extends BaseRepository<Appointment> {
  constructor(prisma: PrismaService) {
    super(prisma, 'appointment');
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return this.findMany({
      where: {
        start: {
          gte: startDate,
          lte: endDate,
        },
        isActive: true,
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
        appointmentId: true,
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

  async findManyPaginated(page: number = 1, limit: number = 10): Promise<{ appointments: Appointment[]; total: number }> {
    const take = Math.min(limit, 50); // Máximo 50 registros
    const skip = (page - 1) * take;

    const [total, appointments] = await Promise.all([
      this.prisma.appointment.count({ where: { isActive: true } }), // Contar solo citas activas
      this.prisma.appointment.findMany({
        where: { isActive: true },
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
        orderBy: { start: 'asc' } // Ordenar por fecha de inicio
      })
    ]);

    return { appointments, total };
  }
}
