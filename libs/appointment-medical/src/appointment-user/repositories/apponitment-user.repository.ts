import { Injectable } from '@nestjs/common';
import { AppointmentMedicalResponse } from '../entities/apponitment-user..entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class ApponitmentUserRepository extends BaseRepository<AppointmentMedicalResponse> {
  constructor(prisma: PrismaService) {
    super(prisma, 'appointment'); // Tabla del esquema de prisma
  }

  // Función para obtener todas las citas médicas CONFIRMADAS asociadas a un staff (usuario)
  async getConfirmedAppointmentsByUserId(userId: string) {
    // 1. Primero verificamos que el usuario está asociado a un staff
    const staff = await this.prisma.staff.findFirst({
      where: { userId, isActive: true },
      select: { id: true, name: true, lastName: true },
    });

    if (!staff) {
      throw new Error('Usuario no asociado a ningún staff médico activo');
    }

    // 2. Obtenemos todas las citas confirmadas para este staff con sus relaciones
    const appointments = await this.prisma.appointment.findMany({
      where: {
        staffId: staff.id,
        status: 'CONFIRMED',
        isActive: true,
      },
      select: {
        id: true,
        start: true,
        end: true,
        status: true,
        staff: {
          select: {
            name: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
            MedicalHistory: {
              where: { isActive: true },
              select: {
                id: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // 3. Formateamos los resultados según el formato solicitado
    return appointments.map((appointment) => ({
      id: appointment.id,
      staff: `${appointment.staff.name} ${appointment.staff.lastName}`,
      service: appointment.service.name,
      branch: appointment.branch.name,
      patient: `${appointment.patient.name} ${appointment.patient.lastName || ''}`,
      start: appointment.start,
      end: appointment.end,
      status: appointment.status,
      medicalHistoryId: appointment.patient.MedicalHistory[0]?.id || null,
    }));
  }

  // Función para obtener todas las citas médicas COMPLETADAS asociadas a un staff (usuario)
  async getCompletedAppointmentsByUserId(userId: string) {
    // 1. Primero verificamos que el usuario está asociado a un staff
    const staff = await this.prisma.staff.findFirst({
      where: { userId, isActive: true },
      select: { id: true, name: true, lastName: true },
    });

    if (!staff) {
      throw new Error('Usuario no asociado a ningún staff médico activo');
    }

    // 2. Obtenemos todas las citas completadas para este staff con sus relaciones
    const appointments = await this.prisma.appointment.findMany({
      where: {
        staffId: staff.id,
        status: 'COMPLETED',
        isActive: true,
      },
      select: {
        id: true,
        start: true,
        end: true,
        status: true,
        staff: {
          select: {
            name: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
            MedicalHistory: {
              where: { isActive: true },
              select: {
                id: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // 3. Formateamos los resultados según el formato solicitado
    return appointments.map((appointment) => ({
      id: appointment.id,
      staff: `${appointment.staff.name} ${appointment.staff.lastName}`,
      service: appointment.service.name,
      branch: appointment.branch.name,
      patient: `${appointment.patient.name} ${appointment.patient.lastName || ''}`,
      start: appointment.start,
      end: appointment.end,
      status: appointment.status,
      medicalHistoryId: appointment.patient.MedicalHistory[0]?.id || null,
    }));
  }

  // Función para obtener todas las citas médicas CONFIRMADAS (para administrativos)
  async getAllConfirmedAppointmentsAdmin() {
    // Obtenemos todas las citas confirmadas con sus relaciones
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        isActive: true,
      },
      select: {
        id: true,
        start: true,
        end: true,
        status: true,
        staff: {
          select: {
            name: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
            MedicalHistory: {
              where: { isActive: true },
              select: {
                id: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // Formateamos los resultados según el formato solicitado
    return appointments.map((appointment) => ({
      id: appointment.id,
      staff: `${appointment.staff.name} ${appointment.staff.lastName}`,
      service: appointment.service.name,
      branch: appointment.branch.name,
      patient: `${appointment.patient.name} ${appointment.patient.lastName || ''}`,
      start: appointment.start,
      end: appointment.end,
      status: appointment.status,
      medicalHistoryId: appointment.patient.MedicalHistory[0]?.id || null,
    }));
  }

  // Función para obtener todas las citas médicas COMPLETADAS (para administrativos)
  async getAllCompletedAppointmentsAdmin() {
    // Obtenemos todas las citas completadas con sus relaciones
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: 'COMPLETED',
        isActive: true,
      },
      select: {
        id: true,
        start: true,
        end: true,
        status: true,
        staff: {
          select: {
            name: true,
            lastName: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
            MedicalHistory: {
              where: { isActive: true },
              select: {
                id: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // Formateamos los resultados según el formato solicitado
    return appointments.map((appointment) => ({
      id: appointment.id,
      staff: `${appointment.staff.name} ${appointment.staff.lastName}`,
      service: appointment.service.name,
      branch: appointment.branch.name,
      patient: `${appointment.patient.name} ${appointment.patient.lastName || ''}`,
      start: appointment.start,
      end: appointment.end,
      status: appointment.status,
      medicalHistoryId: appointment.patient.MedicalHistory[0]?.id || null,
    }));
  }
}

/* 
id: de la cita " appointment"
staff: alex Flores
service: consulta etc 
branch: Sede1
patient: pablo salzar polo
start: fecha inicio
end: fecha fin
status: CONFIRMED
medicalHistoryId: id de la historia del paciente
*/
