import { Injectable } from '@nestjs/common';
import {
  AppointmentMedicalResponse,
  AppointmentResponse,
} from '../entities/apponitment-user..entity';
import { BaseRepository, PrismaService } from '@prisma/prisma';

@Injectable()
export class ApponitmentUserRepository extends BaseRepository<AppointmentMedicalResponse> {
  constructor(prisma: PrismaService) {
    super(prisma, 'appointment'); // Tabla del esquema de prisma
  }

  // Función para obtener citas médicas CONFIRMADAS de un profesional de la salud específico
  async getConfirmedAppointmentsByUserId(
    userId: string,
  ): Promise<AppointmentResponse[]> {
    // 1. Verificamos que el usuario está asociado a un staff
    const staff = await this.prisma.staff.findFirst({
      where: { userId, isActive: true },
      select: { id: true, name: true, lastName: true },
    });

    if (!staff) {
      throw new Error('Usuario no asociado a ningún staff activo');
    }

    // 2. Obtenemos todas las citas confirmadas para este staff
    // Incluimos tanto las citas directamente asignadas como las que fueron reprogramadas hacia este staff
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

  // Función para obtener citas médicas COMPLETADAS de un profesional de la salud específico
  async getCompletedAppointmentsByUserId(
    userId: string,
  ): Promise<AppointmentResponse[]> {
    // 1. Verificamos que el usuario está asociado a un staff
    const staff = await this.prisma.staff.findFirst({
      where: { userId, isActive: true },
      select: { id: true, name: true, lastName: true },
    });

    if (!staff) {
      throw new Error('Usuario no asociado a ningún staff activo');
    }

    // 2. Obtenemos todas las citas completadas para este staff
    // Incluimos tanto las citas directamente asignadas como las que fueron reprogramadas hacia este staff
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

  // Función para obtener todas las citas médicas CONFIRMADAS (para super admin)
  async getAllConfirmedAppointmentsAdmin(): Promise<AppointmentResponse[]> {
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

  // Función para obtener todas las citas médicas COMPLETADAS (para super admin)
  async getAllCompletedAppointmentsAdmin(): Promise<AppointmentResponse[]> {
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

  // Función para obtener citas CONFIRMADAS filtradas por sucursal del personal de l meson
  async getBranchConfirmedAppointmentsByUserId(
    userId: string,
  ): Promise<AppointmentResponse[]> {
    // 1. Verificamos que el usuario está asociado a un staff y obtenemos su sucursal
    const staff = await this.prisma.staff.findFirst({
      where: { userId, isActive: true },
      select: { id: true, name: true, lastName: true, branchId: true },
    });

    if (!staff) {
      throw new Error('Usuario no asociado a ningún staff activo');
    }

    if (!staff.branchId) {
      throw new Error('El usuario no tiene una sucursal asignada');
    }

    // 2. Obtenemos todas las citas confirmadas para esta sucursal
    const appointments = await this.prisma.appointment.findMany({
      where: {
        branchId: staff.branchId,
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

  // Función para obtener citas COMPLETADAS filtradas por sucursal del personal del meson
  async getBranchCompletedAppointmentsByUserId(
    userId: string,
  ): Promise<AppointmentResponse[]> {
    // 1. Verificamos que el usuario está asociado a un staff y obtenemos su sucursal
    const staff = await this.prisma.staff.findFirst({
      where: { userId, isActive: true },
      select: { id: true, name: true, lastName: true, branchId: true },
    });

    if (!staff) {
      throw new Error('Usuario no asociado a ningún staff activo');
    }

    if (!staff.branchId) {
      throw new Error('El usuario no tiene una sucursal asignada');
    }

    // 2. Obtenemos todas las citas completadas para esta sucursal
    const appointments = await this.prisma.appointment.findMany({
      where: {
        branchId: staff.branchId,
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

  /**
   * Actualiza el estado de una cita por su ID (solo a COMPLETED o NO_SHOW)
   * @param appointmentId ID de la cita a actualizar
   * @param status Nuevo estado para la cita (solo COMPLETED o NO_SHOW permitidos)
   * @returns La cita actualizada
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: 'COMPLETED' | 'NO_SHOW',
  ): Promise<AppointmentResponse> {
    // 1. Validar que el estado sea permitido
    if (status !== 'COMPLETED' && status !== 'NO_SHOW') {
      throw new Error(
        'Solo se permite actualizar a los estados COMPLETED o NO_SHOW',
      );
    }

    // 2. Verificar que la cita existe
    const existingAppointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId, isActive: true },
    });

    if (!existingAppointment) {
      throw new Error('La cita no existe o no está activa');
    }

    // 3. Verificar que la cita está en un estado que permite ser cambiado
    if (existingAppointment.status !== 'CONFIRMED') {
      throw new Error('Solo se pueden actualizar citas en estado CONFIRMED');
    }

    // 4. Actualizar el estado de la cita
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      select: {
        id: true,
        status: true,
        start: true,
        end: true,
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

    // 5. Formatear y devolver la respuesta
    return {
      id: updatedAppointment.id,
      staff: `${updatedAppointment.staff.name} ${updatedAppointment.staff.lastName}`,
      service: updatedAppointment.service.name,
      branch: updatedAppointment.branch.name,
      patient: `${updatedAppointment.patient.name} ${updatedAppointment.patient.lastName || ''}`,
      start: updatedAppointment.start,
      end: updatedAppointment.end,
      status: updatedAppointment.status,
      medicalHistoryId:
        updatedAppointment.patient.MedicalHistory[0]?.id || null,
    };
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
