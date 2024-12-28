import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Appointment } from '../entities/appointment.entity';

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
    const updatedAppointment = await this.appointmentRepository.transaction(
      async () => {
        // Si se está actualizando la fecha, verificar disponibilidad
        if (updateAppointmentDto.date) {
          const existingAppointments =
            await this.appointmentRepository.findMany({
              where: {
                personalId: updateAppointmentDto.personalId,
                date: new Date(updateAppointmentDto.date),
                isActive: true,
                NOT: {
                  id: id,
                },
              },
            });

          if (existingAppointments.length > 0) {
            throw new Error(
              'Ya existe una cita programada para este doctor en esta fecha y hora',
            );
          }
        }

        // Preparar los datos de actualización
        const updateData: Partial<Appointment> = {
          ...(updateAppointmentDto.tipoCitaMedicaId && {
            tipoCitaMedicaId: updateAppointmentDto.tipoCitaMedicaId,
          }),
          ...(updateAppointmentDto.personalId && {
            personalId: updateAppointmentDto.personalId,
          }),
          ...(updateAppointmentDto.consultaId && {
            consultaId: updateAppointmentDto.consultaId,
          }),
          ...(updateAppointmentDto.date && {
            date: new Date(updateAppointmentDto.date),
          }),
          ...(updateAppointmentDto.description && {
            description: updateAppointmentDto.description,
          }),
        };

        // Actualizar la cita
        const appointment = await this.appointmentRepository.update(
          id,
          updateData,
        );

        // Registrar auditoría
        await this.auditService.create({
          entityId: appointment.id,
          entityType: 'citaMedica',
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
