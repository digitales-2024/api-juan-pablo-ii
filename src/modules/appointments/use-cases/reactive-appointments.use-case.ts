import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData, HttpResponse } from '@login/login/interfaces';
import { Injectable, HttpStatus } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentRepository } from '../repositories/appointment.repository';

@Injectable()
export class ReactivateAppointmentsUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Appointment[]>> {
    // Reactivar las citas y registrar auditoría
    const reactivatedAppointments =
      await this.appointmentRepository.transaction(async () => {
        const appointments =
          await this.appointmentRepository.reactivateMany(ids);

        // Registrar auditoría para cada cita reactivada
        await Promise.all(
          appointments.map((appointment) =>
            this.auditService.create({
              entityId: appointment.id,
              entityType: 'appointment',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return appointments;
      });

    return {
      statusCode: HttpStatus.OK,
      message: 'Citas médicas reactivadas exitosamente',
      data: reactivatedAppointments,
    };
  }
}
