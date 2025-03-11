import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Appointment } from '../entities/appointment.entity';
import { NoShowAppointmentDto } from '../dto/no-show-appointment.dto';

@Injectable()
export class NoShowAppointmentUseCase {
    private readonly logger = new Logger(NoShowAppointmentUseCase.name);

    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly auditService: AuditService,
    ) { }

    async execute(
        id: string,
        noShowAppointmentDto: NoShowAppointmentDto,
        user: UserData,
    ): Promise<HttpResponse<Appointment>> {
        try {
            this.logger.debug(`Marcando cita con ID: ${id} como NO_SHOW`);

            // Buscar la cita
            const appointment = await this.appointmentRepository.findById(id);
            if (!appointment) {
                throw new BadRequestException(`Cita con ID ${id} no encontrada`);
            }

            // Verificar que la cita esté en estado PENDING
            if (appointment.status !== 'CONFIRMED') {
                this.logger.debug(`Solo se pueden marcar como NO_SHOW las citas confirmadas`);
                return {
                    statusCode: 200,
                    message: 'Solo se pueden marcar como NO_SHOW las citas confirmadas',
                    data: appointment,
                };
            }

            // Actualizar el estado de la cita a NO_SHOW
            const updatedAppointment = await this.appointmentRepository.update(id, {
                status: 'NO_SHOW',
                noShowReason: noShowAppointmentDto.noShowReason,
            });

            this.logger.debug(`Cita ${id} actualizada a estado NO_SHOW`);

            // Registrar auditoría
            await this.auditService.create({
                entityId: appointment.id,
                entityType: 'Appointment',
                action: AuditActionType.UPDATE,
                performedById: user.id,
                createdAt: new Date(),
            });

            return {
                statusCode: 200,
                message: 'Cita marcada como NO_SHOW exitosamente',
                data: updatedAppointment,
            };
        } catch (error) {
            this.logger.error(`Error al marcar cita como NO_SHOW: ${error.message}`, error.stack);
            throw error;
        }
    }
} 