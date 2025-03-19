import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType, AppointmentStatus } from '@prisma/client';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly auditService: AuditService,
  ) { }

  async execute(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    const updatedAppointment = await this.appointmentRepository.transaction(
      async () => {
        // Verificar disponibilidad si se actualiza la fecha/hora
        if (updateAppointmentDto.start && updateAppointmentDto.end) {
          const existingAppointments = await this.appointmentRepository.findMany({
            where: {
              staffId: updateAppointmentDto.staffId,
              start: new Date(updateAppointmentDto.start),
              end: new Date(updateAppointmentDto.end),
              NOT: {
                id: id,
              },
            },
          });

          if (existingAppointments.length > 0) {
            throw new BadRequestException(
              'Ya existe una cita programada para este doctor en esta fecha y hora',
            );
          }
        }

        // Preparar los datos de actualización
        const updateData: Partial<Appointment> = {
          ...(updateAppointmentDto.eventId && { eventId: updateAppointmentDto.eventId }),
          ...(updateAppointmentDto.staffId && { staffId: updateAppointmentDto.staffId }),
          ...(updateAppointmentDto.serviceId && { serviceId: updateAppointmentDto.serviceId }),
          ...(updateAppointmentDto.branchId && { branchId: updateAppointmentDto.branchId }),
          ...(updateAppointmentDto.patientId && { patientId: updateAppointmentDto.patientId }),
          ...(updateAppointmentDto.start && { start: new Date(updateAppointmentDto.start) }),
          ...(updateAppointmentDto.end && { end: new Date(updateAppointmentDto.end) }),
          ...(updateAppointmentDto.status && { status: updateAppointmentDto.status }),
          ...(updateAppointmentDto.type && { type: updateAppointmentDto.type }),
          ...(updateAppointmentDto.notes && { notes: updateAppointmentDto.notes }),
          ...(updateAppointmentDto.cancellationReason && {
            cancellationReason: updateAppointmentDto.cancellationReason,
          }),
          ...(updateAppointmentDto.rescheduledFromId && {
            rescheduledFromId: updateAppointmentDto.rescheduledFromId,
          }),
          ...(updateAppointmentDto.orderId && { orderId: updateAppointmentDto.orderId }),
        };

        // Actualizar la cita
        const appointment = await this.appointmentRepository.update(id, updateData);

        // Si se confirma la cita, crear el evento asociado
        if (appointment.status === AppointmentStatus.CONFIRMED) {
          // await this.createEventForAppointment(appointment);
        }

        // Registrar auditoría
        await this.auditService.create({
          entityId: appointment.id,
          entityType: 'Appointment',
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
