import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType, EventStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma';
import { Appointment } from '../entities/appointment.entity';
import { OrderService } from '@pay/pay/services/order.service';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { OrderType } from '@pay/pay/interfaces/order.types';

@Injectable()
export class CancelAppointmentUseCase {
    private readonly logger = new Logger(CancelAppointmentUseCase.name);

    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly auditService: AuditService,
        private readonly orderService: OrderService,
        private readonly prisma: PrismaService,
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

            // Actualizar el estado de la cita a CANCELLED
            const updatedAppointment = await this.appointmentRepository.update(id, {
                status: 'CANCELLED',
                cancellationReason: cancelAppointmentDto.cancellationReason,
            });

            this.logger.debug(`Cita ${id} actualizada a estado CANCELLED`);

            // Actualizar el evento asociado si existe
            if (appointment.eventId) {
                try {
                    this.logger.debug(`Actualizando evento ${appointment.eventId} asociado a la cita ${id}`);

                    const updatedEvent = await this.prisma.event.update({
                        where: { id: appointment.eventId },
                        data: {
                            color: 'red',
                            status: 'CANCELLED',
                            isCancelled: true,
                            cancellationReason: cancelAppointmentDto.cancellationReason || 'Cita cancelada'
                        }
                    });

                    this.logger.debug(`Evento ${appointment.eventId} actualizado: ${JSON.stringify(updatedEvent)}`);
                } catch (eventError) {
                    this.logger.error(`Error al actualizar el evento asociado a la cita: ${eventError.message}`, eventError.stack);
                    // No lanzamos el error para que no afecte el flujo principal
                }
            }

            // Buscar órdenes directamente asociadas a la cita (tipo MEDICAL_APPOINTMENT_ORDER)
            const orders = await this.orderService.findOrdersByReferenceId(id);

            // Cancelar órdenes asociadas directamente al appointment
            if (orders && orders.length > 0) {
                for (const order of orders) {
                    await this.orderService.cancelOrder(order.id, user);
                    this.logger.debug(`Orden ${order.id} cancelada`);
                }
            }

            // Buscar la orden de prescripción usando el campo orderId (optimización)
            if (appointment.orderId) {
                this.logger.debug(`Cita asociada a orden de prescripción: ${appointment.orderId}`);

                try {
                    // Obtener la orden de prescripción
                    const prescriptionOrder = await this.prisma.order.findFirst({
                        where: {
                            id: appointment.orderId,
                            type: OrderType.MEDICAL_PRESCRIPTION_ORDER,
                            status: { not: 'CANCELLED' },
                            isActive: true
                        }
                    });

                    if (prescriptionOrder) {
                        // Verificar si todas las citas asociadas a esta orden están canceladas
                        const allCitasCanceladas = await this.areAllAppointmentsCancelledForOrder(prescriptionOrder.id);

                        if (allCitasCanceladas) {
                            // Cancelar la orden de prescripción
                            await this.orderService.cancelOrder(prescriptionOrder.id, user);
                            this.logger.debug(`Orden de prescripción ${prescriptionOrder.id} cancelada porque todas sus citas están canceladas`);
                        } else {
                            this.logger.debug(`No se cancela orden de prescripción ${prescriptionOrder.id} porque aún tiene citas activas`);
                        }
                    }
                } catch (orderError) {
                    this.logger.error(`Error al procesar la orden asociada ${appointment.orderId}: ${orderError.message}`, orderError.stack);
                    // No lanzamos el error para que no afecte el flujo principal
                }
            } else {
                // Método de respaldo: buscar entre todas las órdenes de prescripción (para compatibilidad con datos existentes)
                // Este código se puede eliminar cuando todas las citas tengan orderId
                try {
                    // Obtener todas las órdenes de tipo MEDICAL_PRESCRIPTION_ORDER
                    const prescriptionOrders = await this.prisma.order.findMany({
                        where: {
                            type: OrderType.MEDICAL_PRESCRIPTION_ORDER,
                            status: { not: 'CANCELLED' },
                            isActive: true
                        }
                    });

                    for (const order of prescriptionOrders) {
                        try {
                            // Parsear los metadatos para buscar la cita en el array de servicios
                            if (order.metadata) {
                                const metadata: any = JSON.parse(String(order.metadata));

                                if (metadata?.orderDetails?.services && Array.isArray(metadata.orderDetails.services)) {
                                    // Verificar si esta cita está en los servicios de la orden
                                    let appointmentInOrder = false;

                                    for (const service of metadata.orderDetails.services) {
                                        if (service && typeof service === 'object' && service.id && String(service.id) === id) {
                                            appointmentInOrder = true;
                                            break;
                                        }
                                    }

                                    if (appointmentInOrder) {
                                        this.logger.debug(`Cita ${id} encontrada en orden de prescripción ${order.id}`);

                                        // Verificar si todas las citas asociadas están canceladas
                                        const allAppointmentsCancelled = await this.checkAllAppointmentsCancelled(
                                            metadata.orderDetails.services
                                        );

                                        // Si todas las citas están canceladas, cancelar la orden
                                        if (allAppointmentsCancelled) {
                                            await this.orderService.cancelOrder(order.id, user);
                                            this.logger.debug(`Orden de prescripción ${order.id} cancelada porque todas sus citas están canceladas`);
                                        } else {
                                            this.logger.debug(`No se cancela orden de prescripción ${order.id} porque aún tiene citas activas`);
                                        }
                                    }
                                }
                            }
                        } catch (metadataError) {
                            this.logger.error(`Error al procesar los metadatos de la orden ${order.id}: ${metadataError.message}`, metadataError.stack);
                            // Continuar con la siguiente orden
                        }
                    }
                } catch (prescriptionOrderError) {
                    this.logger.error(`Error al buscar órdenes de prescripción: ${prescriptionOrderError.message}`, prescriptionOrderError.stack);
                    // No lanzamos el error para que no afecte el flujo principal
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

    /**
     * Verifica si todas las citas asociadas a una orden de prescripción están canceladas
     * @param services Lista de servicios de la orden (citas)
     * @returns true si todas las citas están canceladas, false si alguna sigue activa
     */
    private async checkAllAppointmentsCancelled(services: any[]): Promise<boolean> {
        if (!services || services.length === 0) {
            return true; // Si no hay servicios, consideramos que todas están canceladas
        }

        for (const service of services) {
            try {
                const appointment = await this.appointmentRepository.findById(service.id);

                // Si alguna cita existe y NO está cancelada, retornar false
                if (appointment && appointment.status !== 'CANCELLED') {
                    return false;
                }
            } catch (error) {
                this.logger.error(`Error al verificar el estado de la cita ${service.id}: ${error.message}`, error.stack);
                // Asumimos que si hay error es porque la cita no existe o hay algún problema
                // continuamos con la siguiente
            }
        }

        // Si llegamos aquí, todas las citas están canceladas o no existen
        return true;
    }

    /**
     * Verifica si todas las citas asociadas a una orden de prescripción están canceladas
     * @param orderId ID de la orden de prescripción
     * @returns true si todas las citas están canceladas, false si alguna sigue activa
     */
    private async areAllAppointmentsCancelledForOrder(orderId: string): Promise<boolean> {
        try {
            // Obtener la orden y sus metadatos
            const order = await this.prisma.order.findUnique({
                where: { id: orderId }
            });

            if (!order || !order.metadata) {
                return true;
            }

            // Parsear los metadatos para obtener los IDs de las citas
            try {
                const metadata: any = JSON.parse(String(order.metadata));

                if (metadata?.orderDetails?.services && Array.isArray(metadata.orderDetails.services)) {
                    // Obtener los IDs de las citas desde los servicios
                    const appointmentIds = metadata.orderDetails.services
                        .filter(service => service && typeof service === 'object' && service.id)
                        .map(service => String(service.id));

                    if (!appointmentIds.length) {
                        return true;
                    }

                    // Verificar cada cita
                    for (const appointmentId of appointmentIds) {
                        const appointment = await this.appointmentRepository.findById(appointmentId);

                        // Si alguna cita existe y NO está cancelada, retornar false
                        if (appointment && appointment.status !== 'CANCELLED') {
                            return false;
                        }
                    }

                    // Si llegamos aquí, todas las citas están canceladas o no existen
                    return true;
                }
            } catch (metadataError) {
                this.logger.error(`Error al procesar metadatos para orden ${orderId}: ${metadataError.message}`, metadataError.stack);
                return false; // Por seguridad, asumimos que no todas están canceladas
            }

            return true; // Si no hay servicios definidos, consideramos que todas están canceladas
        } catch (error) {
            this.logger.error(`Error al verificar citas para la orden ${orderId}: ${error.message}`, error.stack);
            return false; // En caso de error, asumimos que no todas están canceladas por seguridad
        }
    }
} 