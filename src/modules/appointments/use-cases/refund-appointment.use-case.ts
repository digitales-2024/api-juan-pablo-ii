import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Appointment } from '../entities/appointment.entity';
import { OrderService } from '@pay/pay/services/order.service';
import { RefundAppointmentDto } from '../dto/refund-appointment.dto';

@Injectable()
export class RefundAppointmentUseCase {
    private readonly logger = new Logger(RefundAppointmentUseCase.name);

    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly auditService: AuditService,
        private readonly orderService: OrderService,
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

            // // Verificar que la cita no esté ya reembolsada o cancelada
            // if (appointment.status === 'CANCELLED') {
            //     this.logger.debug(`La cita ${id} ya está cancelada`);
            //     return {
            //         statusCode: 200,
            //         message: 'La cita ya está cancelada',
            //         data: appointment,
            //     };
            // }

            // Actualizar el estado de la cita a CANCELLED
            const updatedAppointment = await this.appointmentRepository.update(id, {
                status: 'CANCELLED',
                cancellationReason: `REEMBOLSO: ${refundAppointmentDto.refundReason}`,
            });

            this.logger.debug(`Cita ${id} actualizada a estado CANCELLED por reembolso`);

            // Buscar órdenes asociadas a la cita
            const orders = await this.orderService.findOrdersByReferenceId(id);

            // Reembolsar órdenes y pagos asociados
            if (orders && orders.length > 0) {
                for (const order of orders) {
                    // Cancelar la orden (esto también actualizará los pagos asociados)
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