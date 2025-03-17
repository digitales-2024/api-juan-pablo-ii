import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { Order } from '@pay/pay/entities/order.entity';
import { EventRepository } from '../repositories/event.repository';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class EventObserver {
    private readonly logger = new Logger(EventObserver.name);

    constructor(
        private readonly eventRepository: EventRepository,
        private readonly prisma: PrismaService,
    ) { }

    @OnEvent('order.cancelled')
    async handleOrderCancelled(payload: any) {
        this.logger.log(
            `[EventObserver] Recibido evento order.cancelled: ${JSON.stringify(payload)}`,
        );

        try {
            if (!payload || !payload.order) {
                this.logger.warn('[EventObserver] Payload inválido o sin orden');
                return;
            }

            const { order } = payload;

            this.logger.log(`[EventObserver] Orden ID: ${order.id}`);
            this.logger.log(`[EventObserver] Tipo de orden: ${order.type}`);
            this.logger.log(`[EventObserver] ReferenceId: ${order.referenceId}`);
            this.logger.log(`[EventObserver] Estado de la orden: ${order.status}`);
            this.logger.log(`[EventObserver] Metadata de la orden: ${typeof order.metadata === 'string' ? order.metadata : JSON.stringify(order.metadata)}`);

            // Verificar si la orden es de tipo cita médica o prescripción médica
            if (order.type === OrderType.MEDICAL_APPOINTMENT_ORDER) {
                this.logger.log(`[EventObserver] Procesando orden de tipo MEDICAL_APPOINTMENT_ORDER`);
                await this.handleMedicalAppointmentCancellation(order);
            } else if (order.type === OrderType.MEDICAL_PRESCRIPTION_ORDER) {
                this.logger.log(`[EventObserver] Procesando orden de tipo MEDICAL_PRESCRIPTION_ORDER`);
                await this.handleMedicalPrescriptionCancellation(order);
            } else {
                this.logger.log(
                    `[EventObserver] La orden ${order.id} no es una cita médica ni una prescripción médica, no se requiere actualización del evento`,
                );
            }
        } catch (error) {
            this.logger.error(
                `[EventObserver] Error al procesar la cancelación del evento:`,
                error.stack,
            );
        }
    }

    /**
     * Maneja la cancelación de una orden de tipo cita médica
     * @param order Orden de tipo MEDICAL_APPOINTMENT_ORDER
     */
    private async handleMedicalAppointmentCancellation(order: Order) {
        // El referenceId de la orden contiene el ID de la cita
        const appointmentId = order.referenceId;
        if (!appointmentId) {
            this.logger.warn(`[EventObserver] La orden ${order.id} no tiene un ID de cita asociado`);
            return;
        }

        this.logger.log(`[EventObserver] Buscando cita con ID ${appointmentId}`);

        // Buscar la cita para obtener el ID del evento asociado
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!appointment) {
            this.logger.warn(`[EventObserver] No se encontró la cita con ID ${appointmentId}`);

            // Intentar buscar la cita directamente por el ID de la orden
            const appointmentByOrder = await this.prisma.appointment.findFirst({
                where: { orderId: order.id }
            });

            if (appointmentByOrder) {
                this.logger.log(`[EventObserver] Se encontró cita por ID de orden: ${JSON.stringify(appointmentByOrder)}`);

                if (!appointmentByOrder.eventId) {
                    this.logger.warn(`[EventObserver] La cita encontrada no tiene un evento asociado`);
                    // Aunque no tenga evento asociado, actualizamos el estado de la cita
                    await this.updateAppointmentToCancelled(appointmentByOrder.id, 'Orden cancelada');
                    return;
                }

                await this.updateEventToRed(appointmentByOrder.eventId);
                // También actualizamos el estado de la cita
                await this.updateAppointmentToCancelled(appointmentByOrder.id, 'Orden cancelada');
                return;
            }

            return;
        }

        this.logger.log(`[EventObserver] Cita encontrada: ${JSON.stringify(appointment)}`);

        if (!appointment.eventId) {
            this.logger.warn(`[EventObserver] La cita ${appointmentId} no tiene un evento asociado`);
            // Aunque no tenga evento asociado, actualizamos el estado de la cita
            await this.updateAppointmentToCancelled(appointmentId, 'Orden cancelada');
            return;
        }

        await this.updateEventToRed(appointment.eventId);
        // También actualizamos el estado de la cita
        await this.updateAppointmentToCancelled(appointmentId, 'Orden cancelada');
    }

    /**
     * Maneja la cancelación de una orden de tipo prescripción médica
     * @param order Orden de tipo MEDICAL_PRESCRIPTION_ORDER
     */
    private async handleMedicalPrescriptionCancellation(order: Order) {
        this.logger.log(`[EventObserver] ===== INICIO: Procesando cancelación de prescripción médica para orden ${order.id} =====`);
        this.logger.log(`[EventObserver] Orden completa: ${JSON.stringify(order)}`);

        // Parsear el metadata de la orden
        let metadata: any;
        try {
            metadata = typeof order.metadata === 'string'
                ? JSON.parse(order.metadata)
                : order.metadata;

            this.logger.log(`[EventObserver] Metadata parseado correctamente: ${JSON.stringify(metadata)}`);
        } catch (error) {
            this.logger.error(`[EventObserver] Error al parsear metadata de la orden ${order.id}: ${error.message}`);
            this.logger.error(`[EventObserver] Metadata original: ${order.metadata}`);
            return;
        }

        // Verificar si hay servicios (citas) en el metadata
        const orderDetails = metadata?.orderDetails;
        if (!orderDetails) {
            this.logger.warn(`[EventObserver] No se encontraron detalles de la orden en el metadata`);
            this.logger.warn(`[EventObserver] Metadata completo: ${JSON.stringify(metadata)}`);

            // Intentar buscar citas asociadas directamente al referenceId de la orden
            if (order.referenceId) {
                this.logger.log(`[EventObserver] Intentando buscar citas asociadas al referenceId: ${order.referenceId}`);

                try {
                    // Buscar citas que puedan estar relacionadas con esta prescripción
                    // Nota: Usamos campos que sabemos que existen en el modelo de Appointment
                    const appointmentsByPrescription = await this.prisma.appointment.findMany({
                        where: {
                            OR: [
                                // Buscar en campos de texto que podrían contener el referenceId
                                { notes: { contains: order.referenceId } },
                                // Buscar por el ID de la orden
                                { orderId: order.referenceId }
                            ]
                        }
                    });

                    if (appointmentsByPrescription && appointmentsByPrescription.length > 0) {
                        this.logger.log(`[EventObserver] Se encontraron ${appointmentsByPrescription.length} citas asociadas al referenceId`);

                        for (const appointment of appointmentsByPrescription) {
                            if (appointment.eventId) {
                                this.logger.log(`[EventObserver] Procesando cita ${appointment.id} con eventId ${appointment.eventId}`);
                                await this.updateEventToRed(appointment.eventId);

                                // Actualizar el estado de la cita a CANCELLED
                                await this.updateAppointmentToCancelled(appointment.id, 'Orden de prescripción cancelada');
                            }
                        }

                        this.logger.log(`[EventObserver] Finalizado procesamiento de citas por referenceId`);
                        return;
                    } else {
                        this.logger.warn(`[EventObserver] No se encontraron citas asociadas al referenceId ${order.referenceId}`);
                    }
                } catch (error) {
                    this.logger.error(`[EventObserver] Error al buscar citas por referenceId: ${error.message}`);
                }
            }

            return;
        }

        this.logger.log(`[EventObserver] OrderDetails: ${JSON.stringify(orderDetails)}`);

        // Intentar diferentes estructuras de datos para encontrar los servicios (citas)
        let services = orderDetails.services || [];

        // Si no hay servicios en la estructura principal, intentar otras estructuras conocidas
        if (services.length === 0) {
            // Intentar con prescriptionServices si existe
            if (orderDetails.prescriptionServices && orderDetails.prescriptionServices.length > 0) {
                this.logger.log(`[EventObserver] Usando prescriptionServices como fuente de citas`);
                services = orderDetails.prescriptionServices;
            }
            // Intentar con appointmentIds si existe
            else if (orderDetails.appointmentIds && orderDetails.appointmentIds.length > 0) {
                this.logger.log(`[EventObserver] Usando appointmentIds como fuente de citas`);
                services = orderDetails.appointmentIds.map(id => ({ id }));
            }
        }

        if (services.length === 0) {
            this.logger.warn(`[EventObserver] No se encontraron servicios (citas) en la orden ${order.id}`);
            this.logger.warn(`[EventObserver] OrderDetails completo: ${JSON.stringify(orderDetails)}`);

            // Último intento: buscar citas que tengan esta orden como referencia
            try {
                const appointmentsByOrderId = await this.prisma.appointment.findMany({
                    where: {
                        OR: [
                            { orderId: order.id },
                            // Buscar en campos de texto que podrían contener el ID de la orden
                            { notes: { contains: order.id } }
                        ]
                    }
                });

                if (appointmentsByOrderId && appointmentsByOrderId.length > 0) {
                    this.logger.log(`[EventObserver] Se encontraron ${appointmentsByOrderId.length} citas que referencian a esta orden`);

                    for (const appointment of appointmentsByOrderId) {
                        if (appointment.eventId) {
                            this.logger.log(`[EventObserver] Procesando cita ${appointment.id} con eventId ${appointment.eventId}`);
                            await this.updateEventToRed(appointment.eventId);

                            // Actualizar el estado de la cita a CANCELLED
                            await this.updateAppointmentToCancelled(appointment.id, 'Orden de prescripción cancelada');
                        }
                    }

                    this.logger.log(`[EventObserver] Finalizado procesamiento de citas por orderId`);
                    return;
                }
            } catch (error) {
                this.logger.error(`[EventObserver] Error al buscar citas por orderId: ${error.message}`);
            }

            return;
        }

        this.logger.log(`[EventObserver] Se encontraron ${services.length} servicios (citas) en la orden ${order.id}`);
        this.logger.log(`[EventObserver] Servicios: ${JSON.stringify(services)}`);

        // Procesar cada servicio (cita) en la orden
        for (const service of services) {
            this.logger.log(`[EventObserver] Procesando servicio: ${JSON.stringify(service)}`);

            // Intentar obtener el ID de la cita de diferentes campos posibles
            const appointmentId = service.id || service.appointmentId || service.serviceId;
            if (!appointmentId) {
                this.logger.warn(`[EventObserver] No se pudo determinar el ID de la cita en el servicio: ${JSON.stringify(service)}`);
                continue;
            }

            this.logger.log(`[EventObserver] Procesando cita con ID: ${appointmentId}`);

            try {
                // Buscar la cita para obtener el ID del evento asociado
                const appointment = await this.prisma.appointment.findUnique({
                    where: { id: appointmentId }
                });

                if (!appointment) {
                    this.logger.warn(`[EventObserver] No se encontró la cita con ID ${appointmentId}`);

                    // Intentar buscar la cita por otros medios
                    this.logger.log(`[EventObserver] Intentando buscar la cita por otros medios...`);

                    // Intentar buscar por appointmentId = service.id
                    const appointmentByServiceId = await this.prisma.appointment.findFirst({
                        where: { orderId: service.id }
                    });

                    if (appointmentByServiceId) {
                        this.logger.log(`[EventObserver] Se encontró cita por service.id: ${JSON.stringify(appointmentByServiceId)}`);

                        if (!appointmentByServiceId.eventId) {
                            this.logger.warn(`[EventObserver] La cita encontrada no tiene un evento asociado`);
                            continue;
                        }

                        await this.updateEventToRed(appointmentByServiceId.eventId);

                        // Actualizar el estado de la cita a CANCELLED
                        await this.updateAppointmentToCancelled(appointmentByServiceId.id, 'Orden de prescripción cancelada');

                        continue;
                    }

                    // Intentar buscar por serviceId
                    if (service.serviceId) {
                        const appointmentByServiceId = await this.prisma.appointment.findFirst({
                            where: { serviceId: service.serviceId }
                        });

                        if (appointmentByServiceId) {
                            this.logger.log(`[EventObserver] Se encontró cita por service.serviceId: ${JSON.stringify(appointmentByServiceId)}`);

                            if (!appointmentByServiceId.eventId) {
                                this.logger.warn(`[EventObserver] La cita encontrada no tiene un evento asociado`);
                                continue;
                            }

                            await this.updateEventToRed(appointmentByServiceId.eventId);

                            // Actualizar el estado de la cita a CANCELLED
                            await this.updateAppointmentToCancelled(appointmentByServiceId.id, 'Orden de prescripción cancelada');

                            continue;
                        }
                    }

                    continue;
                }

                this.logger.log(`[EventObserver] Cita encontrada: ${JSON.stringify(appointment)}`);

                if (!appointment.eventId) {
                    this.logger.warn(`[EventObserver] La cita ${appointmentId} no tiene un evento asociado`);

                    // Aún así, actualizar el estado de la cita a CANCELLED
                    await this.updateAppointmentToCancelled(appointmentId, 'Orden de prescripción cancelada');

                    continue;
                }

                this.logger.log(`[EventObserver] Cita tiene eventId: ${appointment.eventId}`);

                // Actualizar el evento asociado a la cita
                const result = await this.updateEventToRed(appointment.eventId);
                this.logger.log(`[EventObserver] Resultado de actualización del evento: ${JSON.stringify(result)}`);

                // Actualizar el estado de la cita a CANCELLED
                await this.updateAppointmentToCancelled(appointmentId, 'Orden de prescripción cancelada');

            } catch (error) {
                this.logger.error(
                    `[EventObserver] Error al procesar la cita ${appointmentId}:`,
                    error.stack,
                );
                // Continuamos con la siguiente cita
            }
        }

        this.logger.log(`[EventObserver] ===== FIN: Procesamiento de cancelación de prescripción médica para orden ${order.id} =====`);
    }

    private async updateEventToRed(eventId: string) {
        this.logger.log(`[EventObserver] Evento asociado a la cita: ${eventId}`);

        // Buscar el evento usando el ID correcto
        const event = await this.eventRepository.findById(eventId);

        if (!event) {
            this.logger.warn(`[EventObserver] No se encontró el evento con ID ${eventId}`);

            // Intentar buscar el evento directamente con Prisma
            try {
                const eventFromPrisma = await this.prisma.event.findUnique({
                    where: { id: eventId }
                });

                if (eventFromPrisma) {
                    this.logger.log(`[EventObserver] Evento encontrado directamente con Prisma: ${JSON.stringify(eventFromPrisma)}`);

                    // Actualizar directamente con Prisma
                    const updatedEvent = await this.prisma.event.update({
                        where: { id: eventId },
                        data: {
                            color: 'red',
                            status: 'CANCELLED',
                            isCancelled: true,
                            cancellationReason: 'Orden cancelada'
                        }
                    });

                    this.logger.log(`[EventObserver] Evento actualizado directamente con Prisma: ${JSON.stringify(updatedEvent)}`);
                    return updatedEvent;
                } else {
                    this.logger.warn(`[EventObserver] No se encontró el evento con ID ${eventId} ni siquiera con Prisma`);
                    return null;
                }
            } catch (prismaError) {
                this.logger.error(`[EventObserver] Error al buscar evento con Prisma: ${prismaError.message}`);
                return null;
            }
        }

        this.logger.log(`[EventObserver] Evento encontrado: ${JSON.stringify(event)}`);
        this.logger.log(`[EventObserver] Actualizando color del evento ${event.id} a rojo y estado a CANCELLED`);

        try {
            // Actualizar directamente todos los campos necesarios en una sola operación
            const updatedEvent = await this.prisma.event.update({
                where: { id: event.id },
                data: {
                    color: 'red',
                    status: 'CANCELLED',
                    isCancelled: true,
                    cancellationReason: 'Orden cancelada'
                }
            });

            this.logger.log(`[EventObserver] Evento actualizado directamente con Prisma: ${JSON.stringify(updatedEvent)}`);

            // Verificar que el evento se haya actualizado correctamente
            const verifiedEvent = await this.eventRepository.findById(event.id);
            this.logger.log(`[EventObserver] Verificación del evento actualizado: ${JSON.stringify(verifiedEvent)}`);

            this.logger.log(
                `[EventObserver] Evento ${event.id} actualizado exitosamente con color rojo y estado CANCELLED`,
            );

            return updatedEvent;
        } catch (updateError) {
            this.logger.error(
                `[EventObserver] Error al actualizar el evento ${event.id}:`,
                updateError.stack,
            );

            // Intentar actualizar con el método del repositorio como fallback
            try {
                this.logger.log(`[EventObserver] Intentando actualizar con método alternativo...`);

                // Primero actualizar el estado y color
                const updatedEvent = await this.eventRepository.updateEventStatus(
                    event.id,
                    EventStatus.CANCELLED,
                    'red'
                );

                this.logger.log(`[EventObserver] Evento actualizado con updateEventStatus: ${JSON.stringify(updatedEvent)}`);

                // Luego actualizar los campos adicionales
                const updatedEventWithCancellation = await this.eventRepository.update(event.id, {
                    isCancelled: true,
                    cancellationReason: 'Orden cancelada'
                });

                this.logger.log(`[EventObserver] Evento actualizado con update adicional: ${JSON.stringify(updatedEventWithCancellation)}`);

                return updatedEventWithCancellation;
            } catch (fallbackError) {
                this.logger.error(
                    `[EventObserver] Error en método alternativo de actualización: ${fallbackError.message}`,
                    fallbackError.stack
                );
                return null;
            }
        }
    }

    /**
     * Actualiza el estado de una cita a CANCELLED
     * @param appointmentId ID de la cita a cancelar
     * @param reason Motivo de la cancelación
     */
    private async updateAppointmentToCancelled(appointmentId: string, reason: string) {
        this.logger.log(`[EventObserver] Actualizando cita ${appointmentId} a estado CANCELLED`);

        try {
            // Obtener el estado actual de la cita
            const appointment = await this.prisma.appointment.findUnique({
                where: { id: appointmentId }
            });

            if (!appointment) {
                this.logger.warn(`[EventObserver] No se encontró la cita ${appointmentId}`);
                return null;
            }

            // Solo actualizar a CANCELLED si no está ya cancelada o completada
            if (appointment.status === AppointmentStatus.CANCELLED ||
                appointment.status === AppointmentStatus.COMPLETED ||
                appointment.status === AppointmentStatus.NO_SHOW) {
                this.logger.log(`[EventObserver] Cita ${appointmentId} ya está en estado ${appointment.status}, no se actualiza`);
                return appointment;
            }

            // Actualizar la cita a estado CANCELLED
            const updatedAppointment = await this.prisma.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: AppointmentStatus.CANCELLED,
                    cancellationReason: reason
                }
            });

            this.logger.log(`[EventObserver] Cita ${appointmentId} actualizada a CANCELLED: ${JSON.stringify(updatedAppointment)}`);
            return updatedAppointment;

        } catch (error) {
            this.logger.error(`[EventObserver] Error al actualizar cita ${appointmentId}: ${error.message}`, error.stack);
            return null;
        }
    }
}
