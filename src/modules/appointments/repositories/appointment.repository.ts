import { Injectable } from '@nestjs/common';
import { BaseRepository, PrismaService } from '@prisma/prisma';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentRepository extends BaseRepository<Appointment> {
  constructor(prisma: PrismaService) {
    super(prisma, 'citaMedica');
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return this.findMany({
      where: {
        fecha: {
          gte: startDate,
          lte: endDate,
        },
        isActive: true,
      },
      include: {
        paciente: true,
        personal: true,
        tipoCita: true,
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
}
