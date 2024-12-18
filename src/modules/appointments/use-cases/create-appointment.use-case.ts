import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Appointment } from '../entities/appointment.entity';
import { AuditActionType } from '@prisma/client';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';

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
    // Verificar disponibilidad del horario
    const existingAppointments = await this.appointmentRepository.findMany({
      where: {
        personalId: createAppointmentDto.personalId,
        fecha: createAppointmentDto.fecha,
        isActive: true,
      },
    });

    if (existingAppointments.length > 0) {
      throw new BadRequestException(
        'El horario seleccionado no está disponible',
      );
    }

    const newAppointment = await this.appointmentRepository.transaction(
      async () => {
        // Crear la cita
        const appointment = await this.appointmentRepository.create({
          ...createAppointmentDto,
          estado: 'PENDIENTE',
          isActive: true,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: appointment.id,
          entityType: 'appointment',
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
