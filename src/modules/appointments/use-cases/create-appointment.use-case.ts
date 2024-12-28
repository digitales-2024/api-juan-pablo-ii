import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createAppointmentDto: CreateAppointmentDto,
    user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    const newAppointment = await this.appointmentRepository.transaction(
      async () => {
        // Verificar si ya existe una cita para ese doctor en esa fecha y hora
        const existingAppointments = await this.appointmentRepository.findMany({
          where: {
            personalId: createAppointmentDto.personalId,
            date: new Date(createAppointmentDto.date),
            isActive: true,
          },
        });

        if (existingAppointments.length > 0) {
          throw new BadRequestException(
            'Ya existe una cita programada para este doctor en esta fecha y hora',
          );
        }

        // Crear la cita
        const appointment = await this.appointmentRepository.create({
          tipoCitaMedicaId: createAppointmentDto.tipoCitaMedicaId,
          personalId: createAppointmentDto.personalId,
          consultaId: createAppointmentDto.consultaId,
          date: new Date(createAppointmentDto.date),
          description: createAppointmentDto.description,
          isActive: true,
        });

        // Registrar la auditoría
        await this.auditService.create({
          entityId: appointment.id,
          entityType: 'citaMedica',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return appointment;
      },
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Cita médica creada exitosamente',
      data: newAppointment,
    };
  }
}
