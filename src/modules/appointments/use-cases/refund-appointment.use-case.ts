import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType, EventStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma';
import { Appointment } from '../entities/appointment.entity';
import { OrderService } from '@pay/pay/services/order.service';
import { RefundAppointmentDto } from '../dto/refund-appointment.dto';
import { EventService } from '@calendar/calendar/event/services/event.service';

@Injectable()
export class RefundAppointmentUseCase {
    private readonly logger = new Logger(RefundAppointmentUseCase.name);

    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly auditService: AuditService,
        private readonly orderService: OrderService,
        private readonly prisma: PrismaService,
        private readonly eventService: EventService,
    ) { }

    async execute(
        id: string,
        refundAppointmentDto: RefundAppointmentDto,
        user: UserData,
    ): Promise<HttpResponse<Appointment>> {
        try {
            this.logger.debug(`Reembolsando cita con ID: ${id}`);

            // Buscar la cita
            const appointment = await this.appointmentRepository.findById(id);
            if (!appointment) {
                throw new BadRequestException(`Cita con ID ${id} no encontrada`);
            }

            if (appointment.status !== 'CONFIRMED') {
                this.logger.debug(`La cita ${id} no está pagada `);
                return {
                    statusCode: 200,
                    message: 'La cita no está pagada',
                    data: appointment,
                };
            }

            // Si la cita es resultado de una reprogramación, verificar el eventId
            if (appointment.rescheduledFromId && !appointment.eventId) {
                this.logger.warn(`Cita ${id} es resultado de reprogramación pero no tiene eventId`);
                // Buscar la cita original para obtener el eventId
                const originalAppointment = await this.appointmentRepository.findById(appointment.rescheduledFromId);
                if (originalAppointment?.eventId) {
                    this.logger.debug(`Recuperando eventId ${originalAppointment.eventId} de la cita original`);
                    // Actualizar la cita actual con el eventId de la original
                    await this.appointmentRepository.update(id, {
                        eventId: originalAppointment.eventId
                    });
                    appointment.eventId = originalAppointment.eventId;
                }
            }

            // Actualizar el estado de la cita a CANCELLED
            const updatedAppointment = await this.appointmentRepository.update(id, {
                status: 'CANCELLED',
                cancellationReason: `REEMBOLSO: ${refundAppointmentDto.refundReason}`,
            });

            this.logger.debug(`Cita ${id} actualizada a estado CANCELLED por reembolso`);

            // Si la cita tiene un evento asociado, actualizarlo a CANCELLED
            if (appointment.eventId) {
                try {
                    this.logger.debug(`Actualizando evento ${appointment.eventId} a CANCELLED`);
                    await this.eventService.directUpdate(appointment.eventId, {
                        status: EventStatus.CANCELLED,
                        color: 'red',
                        updatedAt: new Date()
                    });
                    this.logger.debug(`Evento ${appointment.eventId} actualizado a CANCELLED exitosamente`);
                } catch (eventError) {
                    this.logger.error(`Error al actualizar el evento ${appointment.eventId}: ${eventError.message}`);
                    // No lanzamos el error para no interrumpir el proceso de reembolso
                }
            } else {
                this.logger.warn(`La cita ${id} no tiene un evento asociado`);
            }

            // Buscar órdenes asociadas a la cita
            const orders = await this.orderService.findOrdersByReferenceId(id);

            // Reembolsar órdenes y pagos asociados
            if (orders && orders.length > 0) {
                for (const order of orders) {
                    await this.orderService.refundOrder(order.id, user);
                    this.logger.debug(`Orden ${order.id} marcada para rembolso`);
                }
            }

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
                message: 'Cita reembolsada exitosamente',
                data: updatedAppointment,
            };
        } catch (error) {
            this.logger.error(`Error al reembolsar cita: ${error.message}`, error.stack);
            throw error;
        }
    }
} 