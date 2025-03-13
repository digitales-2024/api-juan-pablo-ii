import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { Order } from '@pay/pay/entities/order.entity';
import { EventRepository } from '../repositories/event.repository';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma';

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

            // Verificar si la orden es de tipo cita médica
            if (order.type !== OrderType.MEDICAL_APPOINTMENT_ORDER) {
                this.logger.log(
                    `[EventObserver] La orden ${order.id} no es una cita médica, no se requiere actualización del evento`,
                );
                return;
            }

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
                    where: { appointmentId: order.id }
                });

                if (appointmentByOrder) {
                    this.logger.log(`[EventObserver] Se encontró cita por ID de orden: ${JSON.stringify(appointmentByOrder)}`);

                    if (!appointmentByOrder.eventId) {
                        this.logger.warn(`[EventObserver] La cita encontrada no tiene un evento asociado`);
                        return;
                    }

                    await this.updateEventToRed(appointmentByOrder.eventId);
                    return;
                }

                return;
            }

            this.logger.log(`[EventObserver] Cita encontrada: ${JSON.stringify(appointment)}`);

            if (!appointment.eventId) {
                this.logger.warn(`[EventObserver] La cita ${appointmentId} no tiene un evento asociado`);
                return;
            }

            await this.updateEventToRed(appointment.eventId);
        } catch (error) {
            this.logger.error(
                `[EventObserver] Error al procesar la cancelación del evento:`,
                error.stack,
            );
        }
    }

    private async updateEventToRed(eventId: string) {
        this.logger.log(`[EventObserver] Evento asociado a la cita: ${eventId}`);

        // Buscar el evento usando el ID correcto
        const event = await this.eventRepository.findById(eventId);

        if (!event) {
            this.logger.warn(`[EventObserver] No se encontró el evento con ID ${eventId}`);
            return;
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
            }
        }
    }
}
