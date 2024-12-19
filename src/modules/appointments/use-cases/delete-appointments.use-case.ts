import { HttpStatus, Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Appointment } from '../entities/appointment.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteAppointmentsDto } from '../dto/delete-appointments.dto';

@Injectable()
export class DeleteAppointmentsUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteAppointmentsDto: DeleteAppointmentsDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment[]>> {
    const deletedAppointments = await this.appointmentRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las citas actualizadas
        const appointments = await this.appointmentRepository.softDeleteMany(
          deleteAppointmentsDto.ids,
        );

        // Registra la auditoría para cada cita eliminada
        await Promise.all(
          appointments.map((appointment) =>
            this.auditService.create({
              entityId: appointment.id,
              entityType: 'appointment',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return appointments;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Citas médicas eliminadas exitosamente',
      data: deletedAppointments,
    };
  }
}
