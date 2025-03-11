import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { Appointment } from '../entities/appointment.entity';
import { OrderService } from '@pay/pay/services/order.service';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';

@Injectable()
export class CancelAppointmentUseCase {
    private readonly logger = new Logger(CancelAppointmentUseCase.name);

    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly auditService: AuditService,
        private readonly orderService: OrderService,
    ) { }

    async execute(
        id: string,
        cancelAppointmentDto: CancelAppointmentDto,
        user: UserData,
    ): Promise<HttpResponse<Appointment>> {
        try {
            this.logger.debug(`Cancelando cita con ID: ${id}`);

            // Buscar la cita
            const appointment = await this.appointmentRepository.findById(id);
            if (!appointment) {
                throw new BadRequestException(`Cita con ID ${id} no encontrada`);
            }




            if (appointment.status !== 'PENDING') {
                this.logger.debug(`Solo se puede cancelar citas pendientes`);
                return {
                    statusCode: 200,
                    message: 'Solo se puede cancelar citas pendientes',
                    data: appointment,
                };
            }


            // // Verificar que la cita no esté ya cancelada
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
                cancellationReason: cancelAppointmentDto.cancellationReason,
            });

            this.logger.debug(`Cita ${id} actualizada a estado CANCELLED`);

            // Buscar órdenes asociadas a la cita
            const orders = await this.orderService.findOrdersByReferenceId(id);

            // Cancelar órdenes asociadas
            if (orders && orders.length > 0) {
                for (const order of orders) {
                    await this.orderService.cancelOrder(order.id, user);
                    this.logger.debug(`Orden ${order.id} cancelada`);
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
                message: 'Cita cancelada exitosamente',
                data: updatedAppointment,
            };
        } catch (error) {
            this.logger.error(`Error al cancelar cita: ${error.message}`, error.stack);
            throw error;
        }
    }
} 