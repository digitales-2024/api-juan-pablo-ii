import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType, EventStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma';
import { Appointment } from '../entities/appointment.entity';
import { OrderService } from '@pay/pay/services/order.service';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import * as moment from 'moment-timezone';
import { EventService } from '@calendar/calendar/event/services/event.service';

@Injectable()
export class RescheduleAppointmentUseCase {
    private readonly logger = new Logger(RescheduleAppointmentUseCase.name);
    private readonly timeZone = 'America/Lima';

    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly auditService: AuditService,
        private readonly orderService: OrderService,
        private readonly prisma: PrismaService,
        private readonly eventService: EventService,
    ) { }

    async execute(
        id: string,
        rescheduleAppointmentDto: RescheduleAppointmentDto,
        user: UserData,
    ): Promise<HttpResponse<Appointment>> {
        try {
            this.logger.debug(`Reprogramando cita con ID: ${id}`);

            // Buscar la cita original
            const originalAppointment = await this.appointmentRepository.findById(id);
            if (!originalAppointment) {
                throw new BadRequestException(`Cita con ID ${id} no encontrada`);
            }

            if (originalAppointment.status !== 'PENDING' && originalAppointment.status !== 'CONFIRMED') {
                this.logger.debug(`Solo se puede reprogramar citas pendientes o confirmadas`);
                return {
                    statusCode: 200,
                    message: 'Solo se puede reprogramar citas pendientes o confirmadas',
                    data: originalAppointment,
                };
            }

            // Calcular nueva fecha de inicio y fin (duración fija de 15 minutos)
            const start = new Date(rescheduleAppointmentDto.newDateTime);
            const end = new Date(start.getTime() + 15 * 60 * 1000); // 15 minutos después

            this.logger.debug(`Nueva fecha inicio (UTC): ${start.toISOString()}`);
            this.logger.debug(`Nueva fecha fin (UTC): ${end.toISOString()}`);
            this.logger.debug(`Nueva fecha inicio Lima: ${moment(start).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')}`);
            this.logger.debug(`Nueva fecha fin Lima: ${moment(end).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')}`);

            // Validar alineación a slots de 15 mins (00, 15, 30, 45)
            const startLima = moment(start).tz(this.timeZone);
            if (startLima.minutes() % 15 !== 0 || startLima.seconds() !== 0 || startLima.milliseconds() !== 0) {
                throw new BadRequestException('La hora de inicio debe estar alineada a intervalos de 15 minutos');
            }

            // Buscar TURNOS del doctor que contengan el slot
            this.logger.debug(`Buscando TURNO para staff: ${originalAppointment.staffId}`);
            const validTurn = await this.eventService.findAvailableTurn(
                originalAppointment.staffId,
                start,
                end
            );

            if (!validTurn) {
                this.logger.warn(`No se encontró TURNO disponible para el staff ${originalAppointment.staffId}`);
                this.logger.warn(`Rango buscado (UTC): ${start.toISOString()} - ${end.toISOString()}`);
                this.logger.warn(`Rango buscado (Lima): ${moment(start).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')} - ${moment(end).tz(this.timeZone).format('YYYY-MM-DD HH:mm:ss')}`);
                throw new BadRequestException('No hay turnos disponibles para este horario');
            }

            this.logger.debug(`TURNO encontrado: ${JSON.stringify(validTurn)}`);

            // Verificar solapamientos
            const overlappingAppointments = await this.appointmentRepository.findMany({
                where: {
                    staffId: originalAppointment.staffId,
                    status: 'CONFIRMED',
                    isActive: true,
                    OR: [
                        {
                            AND: [
                                { start: { lt: end } },
                                { end: { gt: start } }
                            ]
                        },
                        { start: { equals: start } }
                    ]
                }
            });

            if (overlappingAppointments.length > 0) {
                this.logger.warn(`Citas CONFIRMADAS solapadas encontradas: ${JSON.stringify(overlappingAppointments)}`);
                this.logger.warn(`Total de citas solapadas: ${overlappingAppointments.length}`);
                this.logger.warn(`Horarios de citas solapadas: ${overlappingAppointments.map(a => `${a.start.toISOString()} - ${a.end.toISOString()}`).join(', ')}`);
                throw new BadRequestException('Ya existe una cita confirmada para este doctor en esta fecha y hora');
            }

            // Crear nueva cita con la fecha reprogramada
            // Extraemos las propiedades que necesitamos de la cita original, sin incluir el ID
            const { id: _, ...appointmentWithoutId } = originalAppointment;

            // Primero creamos la cita sin eventId para evitar el error de unique constraint
            const newAppointment = await this.appointmentRepository.create({
                ...appointmentWithoutId,
                start: start,
                end: end,
                // Mantener el mismo estado que tenía la cita original
                status: originalAppointment.status,
                rescheduledFromId: id,
                rescheduleReason: rescheduleAppointmentDto.rescheduleReason,
                // No asignar eventId inicialmente para evitar el error de unique constraint
                eventId: undefined
            });

            this.logger.debug(`Nueva cita creada con ID: ${newAppointment.id}`);

            // Actualizar la cita original
            const updatedOriginalAppointment = await this.appointmentRepository.update(id, {
                status: 'RESCHEDULED',
                rescheduleReason: rescheduleAppointmentDto.rescheduleReason,
            });

            this.logger.debug(`Cita ${id} actualizada a estado RESCHEDULED y nueva cita creada con ID: ${newAppointment.id}`);

            // Manejar el evento asociado si existe
            let newEventId = undefined;
            if (originalAppointment.eventId) {
                try {
                    this.logger.debug(`Procesando evento ${originalAppointment.eventId} asociado a la cita ${id}`);

                    // Obtener el evento actual para preservar sus propiedades
                    const currentEvent = await this.prisma.event.findUnique({
                        where: { id: originalAppointment.eventId }
                    });

                    if (currentEvent) {
                        // Actualizar el evento existente con las nuevas fechas
                        await this.prisma.event.update({
                            where: { id: originalAppointment.eventId },
                            data: {
                                start: start,
                                end: end,
                                updatedAt: new Date()
                            }
                        });

                        this.logger.debug(`Evento ${originalAppointment.eventId} actualizado con nuevas fechas`);

                        // Asignar el mismo eventId a la nueva cita
                        newEventId = originalAppointment.eventId;

                        // Actualizar la nueva cita con el ID del evento
                        await this.appointmentRepository.update(newAppointment.id, {
                            eventId: newEventId
                        });

                        this.logger.debug(`Cita reprogramada ${newAppointment.id} actualizada con el eventId: ${newEventId}`);
                    } else {
                        this.logger.warn(`No se encontró el evento ${originalAppointment.eventId} para actualizar`);
                    }
                } catch (eventError) {
                    this.logger.error(`Error al procesar el evento asociado a la cita: ${eventError.message}`, eventError.stack);
                }
            } else {
                this.logger.debug(`La cita original no tiene un evento asociado, no se requiere actualización de evento`);
            }

            // Buscar órdenes asociadas a la cita original
            const orders = await this.orderService.findOrdersByReferenceId(id);

            // Actualizar las órdenes para que apunten a la nueva cita
            if (orders && orders.length > 0) {
                this.logger.debug(`Se encontraron ${orders.length} órdenes asociadas a la cita original`);

                for (const order of orders) {
                    try {
                        // Actualizar el referenceId de la orden para que apunte a la nueva cita
                        await this.orderService.update(order.id, {
                            referenceId: newAppointment.id
                        }, user);
                        this.logger.debug(`Orden ${order.id} actualizada con nuevo referenceId: ${newAppointment.id}`);
                    } catch (orderError) {
                        this.logger.error(`Error al actualizar la orden ${order.id}: ${orderError.message}`, orderError.stack);
                    }
                }
            } else {
                this.logger.debug(`No se encontraron órdenes asociadas a la cita ${id}`);
            }

            // Registrar auditoría
            await this.auditService.create({
                entityId: originalAppointment.id,
                entityType: 'Appointment',
                action: AuditActionType.UPDATE,
                performedById: user.id,
                createdAt: new Date(),
            });

            return {
                statusCode: 200,
                message: 'Cita reprogramada exitosamente',
                data: newAppointment,
            };
        } catch (error) {
            this.logger.error(`Error al reprogramar cita: ${error.message}`, error.stack);
            throw error;
        }
    }
}
