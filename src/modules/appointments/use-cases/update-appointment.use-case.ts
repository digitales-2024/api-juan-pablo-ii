import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData, HttpResponse } from '@login/login/interfaces';
import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentRepository } from '../repositories/appointment.repository';

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    // Si se está actualizando la fecha, verificar disponibilidad
    if (updateAppointmentDto.fecha) {
      const existingAppointments = await this.appointmentRepository.findMany({
        where: {
          personalId: updateAppointmentDto.personalId,
          fecha: updateAppointmentDto.fecha,
          isActive: true,
          NOT: {
            id: id,
          },
        },
      });

      if (existingAppointments.length > 0) {
        throw new BadRequestException(
          'El horario seleccionado no está disponible',
        );
      }
    }

    const updatedAppointment = await this.appointmentRepository.transaction(
      async () => {
        const appointment = await this.appointmentRepository.update(
          id,
          updateAppointmentDto,
        );

        // Registrar auditoría
        await this.auditService.create({
          entityId: appointment.id,
          entityType: 'appointment',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return appointment;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Cita médica actualizada exitosamente',
      data: updatedAppointment,
    };
  }
}
