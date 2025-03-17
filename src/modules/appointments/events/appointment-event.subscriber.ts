import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { Order } from '@pay/pay/entities/order.entity';
import { UserData } from '@login/login/interfaces';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentStatus } from '@prisma/client';
import { EventService } from 'libs/calendar/src/event/services/event.service';
import { CreateEventDto, EventStatus } from 'libs/calendar/src/event/dto/create-event.dto';
import { EventType } from 'libs/calendar/src/event/entities/event-type.enum';
import { StockRepository } from 'libs/inventory/src/stock/repositories/stock.repository';
import { OutgoingService } from 'libs/inventory/src/outgoing/services/outgoing.service';
import { CompensationService } from 'libs/inventory/src/compensation/compensation.service';
import { CreateOutgoingDtoStorage } from 'libs/inventory/src/outgoing/dto/create-outgoingStorage.dto';

// Interfaz para los datos de cita en el metadata de la orden
interface AppointmentOrderData {
    appointmentId: string;
    patientId: string;
    staffId: string;
    serviceId: string;
    date: string;
    time: string;
    price: number;
}

// Interfaz para los datos de prescripción médica en el metadata de la orden
interface PrescriptionOrderData {
    prescriptionId: string;
    patientId: string;
    doctorId: string;
    medications: {
        id: string;
        name: string;
        quantity: number;
        instructions: string;
        storageId?: string;
    }[];
}

@Injectable()
export class AppointmentEventSubscriber {
    private readonly logger = new Logger(AppointmentEventSubscriber.name);

    constructor(
        private readonly appointmentService: AppointmentService,
        private readonly eventService: EventService,
        private readonly stockRepository: StockRepository,
        private readonly outgoingService: OutgoingService,
        private readonly compensationService: CompensationService,
    ) { }

    @OnEvent('order.completed')
    async handleOrderCompleted(payload: {
        order: Order;
        metadata?: {
            paymentId: string;
            verifiedBy: string;
            verificationDate: Date;
        };
    }) {
        this.logger.log(
            `[handleOrderCompleted] Received order.completed event for order: ${payload.order.id}`,
        );

        this.logger.log(`[handleOrderCompleted] Order type: ${payload.order.type}`);
        this.logger.log(`[handleOrderCompleted] Order metadata: ${payload.order.metadata}`);

        if (payload.metadata) {
            this.logger.log(`[handleOrderCompleted] Payment verification metadata:`);
            this.logger.log(`[handleOrderCompleted] Object:`, payload.metadata);
        }

        try {
            const { order, metadata } = payload;
            const userId = metadata?.verifiedBy;

            this.logger.log(`[handleOrderCompleted] Order type: ${order.type}`);
            this.logger.log(`[handleOrderCompleted] Should process appointment: ${this.shouldProcessAppointment(order)}`);

            if (!this.shouldProcessAppointment(order)) {
                this.logger.log(
                    `[handleOrderCompleted] Order ${order.id} does not require appointment processing`,
                );
                return;
            }

            this.logger.log(
                `[handleOrderCompleted] Starting appointment processing for order ${order.id}`,
            );

            await this.processAppointmentOrder(order, userId);

            this.logger.log(
                `[handleOrderCompleted] Successfully processed appointment for order ${order.id}`,
            );
        } catch (error) {
            this.logger.error(
                `[handleOrderCompleted] Error processing appointment for order ${payload.order.id}:`,
                error.stack,
            );

            // Si es una orden de prescripción médica, iniciamos el flujo de compensación
            if (payload.order.type === OrderType.MEDICAL_PRESCRIPTION_ORDER) {
                this.logger.log(
                    `[handleOrderCompleted] Initiating compensation flow for failed prescription order ${payload.order.id}`,
                );
                try {
                    await this.compensationService.compensateFailedMovements(payload.order);
                } catch (compError) {
                    this.logger.error(
                        `[handleOrderCompleted] Error during compensation for order ${payload.order.id}:`,
                        compError.stack,
                    );
                }
            }
        }
    }

    private shouldProcessAppointment(order: Order): boolean {
        return [
            OrderType.MEDICAL_APPOINTMENT_ORDER,
            OrderType.MEDICAL_PRESCRIPTION_ORDER,
        ].includes(order.type as OrderType);
    }

    private async processAppointmentOrder(order: Order, userId: string) {
        this.logger.log(`Starting processAppointmentOrder for order ${order.id} with type ${order.type}`);

        // Procesamos según el tipo de orden
        if (order.type === OrderType.MEDICAL_APPOINTMENT_ORDER) {
            this.logger.log(`Processing as MEDICAL_APPOINTMENT_ORDER`);
            await this.processMedicalAppointment(order, userId);
        } else if (order.type === OrderType.MEDICAL_PRESCRIPTION_ORDER) {
            this.logger.log(`Processing as MEDICAL_PRESCRIPTION_ORDER`);
            await this.processMedicalPrescription(order, userId);
        } else {
            this.logger.log(`Order ${order.id} is not an appointment or prescription order, skipping processing`);
            return;
        }

        this.logger.log(`Completed processAppointmentOrder for order ${order.id}`);
    }

    private async processMedicalAppointment(order: Order, userId: string) {
        this.logger.log(`Processing medical appointment order ${order.id}`);
        this.logger.log(`Order reference ID: ${order.referenceId}`);
        this.logger.log(`User ID: ${userId}`);

        let metadata: any;
        try {
            metadata =
                typeof order.metadata === 'string'
                    ? JSON.parse(order.metadata)
                    : order.metadata;

            this.logger.log(`Successfully parsed metadata in processMedicalAppointment`);
        } catch (error) {
            this.logger.error(`Error parsing metadata in processMedicalAppointment: ${error.message}`);
            throw new Error(
                `Invalid metadata format for order ${order.id}: ${error.message}`,
            );
        }

        this.logger.debug('Metadata structure:', JSON.stringify(metadata, null, 2));

        // Extraer datos de la cita del metadata
        // Primero intentamos con la estructura esperada (appointmentData)
        let appointmentData = metadata?.appointmentData as AppointmentOrderData;

        this.logger.log(`Initial appointmentData: ${JSON.stringify(appointmentData)}`);

        // Si no existe appointmentData, intentamos con la estructura alternativa (orderDetails)
        if (!appointmentData && metadata?.orderDetails?.transactionType === 'MEDICAL_APPOINTMENT') {
            this.logger.log(`No appointmentData found, trying with orderDetails`);
            const orderDetails = metadata.orderDetails;

            // Si el appointmentId está vacío pero tenemos referenceId en la orden, usamos ese
            // El referenceId de la orden debe contener el ID de la cita
            const appointmentId = orderDetails.appointmentId || order.referenceId;

            this.logger.log(`Using appointmentId: ${appointmentId}`);

            if (appointmentId) {
                appointmentData = {
                    appointmentId: appointmentId,
                    patientId: metadata?.patientDetails?.id || '',
                    staffId: orderDetails.staffId || '',
                    serviceId: orderDetails.serviceId || '',
                    date: orderDetails.consultationDate || '',
                    time: '',
                    price: orderDetails.transactionDetails?.total || 0
                };

                // Registrar información adicional para depuración
                this.logger.debug(`Constructed appointmentData from orderDetails:`, appointmentData);

                // Si no tenemos patientId pero tenemos DNI, podríamos buscar el paciente por DNI
                if (!appointmentData.patientId && metadata?.patientDetails?.dni) {
                    this.logger.debug(`No patientId found, but DNI is available: ${metadata.patientDetails.dni}`);
                    // Aquí se podría implementar una búsqueda del paciente por DNI si es necesario
                }
            }
        }

        // Si aún no tenemos appointmentId, intentamos usar directamente el referenceId de la orden
        if (!appointmentData || !appointmentData.appointmentId) {
            if (order.referenceId) {
                this.logger.log(`No valid appointment data found, using order.referenceId: ${order.referenceId}`);
                appointmentData = {
                    appointmentId: order.referenceId,
                    patientId: metadata?.patientDetails?.id || '',
                    staffId: metadata?.orderDetails?.staffId || '',
                    serviceId: metadata?.orderDetails?.serviceId || '',
                    date: metadata?.orderDetails?.consultationDate || '',
                    time: '',
                    price: metadata?.orderDetails?.transactionDetails?.total || 0
                };
            } else {
                this.logger.error(`No valid appointment data found in order ${order.id} and no referenceId available`);
                throw new Error(`No valid appointment data found in order ${order.id}`);
            }
        }

        this.logger.log(`Final appointmentData: ${JSON.stringify(appointmentData)}`);

        // Preparar userData
        const userData: UserData = {
            id: userId,
            name: 'System',
            email: 'system@system.com',
            phone: '0000000000',
            isSuperAdmin: true,
            roles: [],
        };

        try {
            // Obtener la cita completa para tener acceso a todos sus datos, incluyendo el eventId
            const appointment = await this.appointmentService.findOne(appointmentData.appointmentId);

            if (!appointment) {
                this.logger.error(`Appointment ${appointmentData.appointmentId} not found`);
                throw new Error(`Appointment ${appointmentData.appointmentId} not found`);
            }

            this.logger.log(`Retrieved appointment: ${JSON.stringify(appointment)}`);
            this.logger.log(`Appointment eventId: ${appointment.eventId || 'none'}`);

            // Verificar si esta cita es resultado de una reprogramación
            if (appointment.rescheduledFromId) {
                this.logger.log(`Esta cita ${appointmentData.appointmentId} es resultado de una reprogramación de la cita ${appointment.rescheduledFromId}`);

                // Si la cita no tiene eventId pero es una reprogramación, intentamos obtener el eventId de la cita original
                if (!appointment.eventId) {
                    try {
                        const originalAppointment = await this.appointmentService.findOne(appointment.rescheduledFromId);
                        if (originalAppointment && originalAppointment.eventId) {
                            this.logger.log(`Obteniendo eventId ${originalAppointment.eventId} de la cita original ${appointment.rescheduledFromId}`);

                            // Actualizar la cita actual con el eventId de la cita original
                            await this.appointmentService.update(
                                appointmentData.appointmentId,
                                {
                                    eventId: originalAppointment.eventId
                                },
                                userData
                            );

                            this.logger.log(`Cita ${appointmentData.appointmentId} actualizada con eventId ${originalAppointment.eventId} de la cita original`);

                            // Actualizar el objeto appointment en memoria para que tenga el eventId
                            appointment.eventId = originalAppointment.eventId;
                        }
                    } catch (error) {
                        this.logger.error(`Error al obtener la cita original ${appointment.rescheduledFromId}: ${error.message}`);
                        // Continuamos con el flujo normal aunque no se haya podido obtener el eventId
                    }
                }
            }

            // Actualizar el estado de la cita a CONFIRMED
            this.logger.log(`Updating appointment ${appointmentData.appointmentId} to CONFIRMED status`);

            const updateResult = await this.appointmentService.update(
                appointmentData.appointmentId,
                {
                    status: AppointmentStatus.CONFIRMED,
                },
                userData,
            );

            this.logger.log(
                `Successfully updated appointment ${appointmentData.appointmentId} status to CONFIRMED`,
            );

            // Actualizar o crear el evento en el calendario
            try {
                this.logger.log(`Calling createAppointmentEvent for appointment ${appointmentData.appointmentId}`);
                const eventResult = await this.createAppointmentEvent(order, appointmentData, userData);
                if (eventResult) {
                    this.logger.log(`Event processed successfully with ID: ${eventResult.data?.id || 'unknown'}`);
                } else {
                    this.logger.warn(`Event processing returned null or undefined`);
                }
            } catch (eventError) {
                this.logger.error(`Error processing event for appointment ${appointmentData.appointmentId}:`, eventError.stack);
                // No lanzamos el error para que no afecte el flujo principal
            }

            return updateResult;
        } catch (error) {
            this.logger.error('Error updating appointment status:', {
                orderId: order.id,
                appointmentId: appointmentData.appointmentId,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Crea o actualiza un evento de tipo CITA en el calendario para una cita médica confirmada
     * @param order - Orden de pago
     * @param appointmentData - Datos de la cita
     * @param userData - Datos del usuario
     */
    private async createAppointmentEvent(
        order: Order,
        appointmentData: AppointmentOrderData,
        userData: UserData
    ) {
        this.logger.log(`=== INICIO: createAppointmentEvent para cita ${appointmentData.appointmentId} ===`);
        this.logger.log(`Order ID: ${order.id}, Reference ID: ${order.referenceId}`);

        try {
            // Primero verificar si la cita ya tiene un evento asociado
            this.logger.log(`Buscando cita con ID: ${appointmentData.appointmentId}`);
            const appointment = await this.appointmentService.findOne(appointmentData.appointmentId);
            this.logger.log(`Cita encontrada: ${JSON.stringify(appointment, null, 2)}`);
            this.logger.log(`EventId en la cita: ${appointment?.eventId || 'NO TIENE'}`);

            // Verificar si la cita es una reprogramación y está confirmada
            // Si es una reprogramación de una cita confirmada, solo actualizamos fechas sin cambiar estado ni color
            const isRescheduledConfirmed = appointment &&
                appointment.rescheduledFromId &&
                appointment.status === AppointmentStatus.CONFIRMED;

            if (isRescheduledConfirmed) {
                this.logger.log(`Esta es una reprogramación de una cita CONFIRMADA. Solo actualizaremos fechas.`);
            }

            // Obtener los datos del paciente para el título del evento
            let metadata: any;
            try {
                metadata = typeof order.metadata === 'string'
                    ? JSON.parse(order.metadata)
                    : order.metadata;
                this.logger.log(`Metadata parseado correctamente`);
            } catch (error) {
                this.logger.error(`Error parsing metadata for order ${order.id}: ${error.message}`);
                metadata = {};
            }

            const orderDetails = metadata?.orderDetails || {};
            const patientDetails = metadata?.patientDetails || {};

            this.logger.log(`Order details: ${JSON.stringify(orderDetails, null, 2)}`);
            this.logger.log(`Patient details: ${JSON.stringify(patientDetails, null, 2)}`);

            // Determinar las fechas de inicio y fin del evento
            let startDate = new Date();
            let endDate = new Date();

            if (orderDetails.consultationDate) {
                startDate = new Date(orderDetails.consultationDate);

                // Si tenemos hora de inicio y fin específicas
                if (orderDetails.appointmentStart) {
                    startDate = new Date(orderDetails.appointmentStart);
                }

                if (orderDetails.appointmentEnd) {
                    endDate = new Date(orderDetails.appointmentEnd);
                } else {
                    // Por defecto, la cita dura 30 minutos
                    endDate = new Date(startDate);
                    endDate.setMinutes(endDate.getMinutes() + 30);
                }
            } else if (appointmentData.date) {
                startDate = new Date(appointmentData.date);
                if (appointmentData.time) {
                    const [hours, minutes] = appointmentData.time.split(':').map(Number);
                    startDate.setHours(hours, minutes, 0, 0);
                }

                // Por defecto, la cita dura 30 minutos
                endDate = new Date(startDate);
                endDate.setMinutes(endDate.getMinutes() + 30);
            }

            this.logger.log(`Fechas calculadas - Inicio: ${startDate.toISOString()}, Fin: ${endDate.toISOString()}`);

            // Intentar obtener el staffId y branchId directamente de la cita si no están en los metadatos
            let staffId = appointmentData.staffId || orderDetails.staffId || '';
            let branchId = orderDetails.branchId || '';

            // Si aún no tenemos staffId o branchId, intentamos obtenerlos directamente de la cita
            if (!staffId || !branchId) {
                if (appointment) {
                    this.logger.log(`Obteniendo staffId y branchId de la cita`);

                    if (!staffId && appointment.staffId) {
                        staffId = appointment.staffId;
                        this.logger.log(`Using staffId from appointment: ${staffId}`);
                    }

                    if (!branchId && appointment.branchId) {
                        branchId = appointment.branchId;
                        this.logger.log(`Using branchId from appointment: ${branchId}`);
                    }

                    // Si tenemos fechas de inicio y fin en la cita, las usamos
                    if (appointment.start) {
                        startDate = new Date(appointment.start);
                        this.logger.log(`Using start date from appointment: ${startDate.toISOString()}`);
                    }

                    if (appointment.end) {
                        endDate = new Date(appointment.end);
                        this.logger.log(`Using end date from appointment: ${endDate.toISOString()}`);
                    }
                }
            }

            this.logger.log(`StaffId final: ${staffId}, BranchId final: ${branchId}`);

            // Verificar que los campos requeridos estén presentes
            if (!staffId) {
                this.logger.warn(`No staffId found for appointment ${appointmentData.appointmentId}, skipping event creation`);
                return null;
            }

            if (!branchId) {
                this.logger.warn(`No branchId found for appointment ${appointmentData.appointmentId}, skipping event creation`);
                return null;
            }

            // Variable para almacenar el ID del evento a actualizar
            let eventIdToUpdate = null;
            let existingEvent = null;

            // Caso 1: La cita ya tiene un evento asociado
            if (appointment && appointment.eventId) {
                this.logger.log(`CASO 1: La cita tiene eventId: ${appointment.eventId}`);
                eventIdToUpdate = appointment.eventId;

                // Intentar obtener el evento existente
                try {
                    this.logger.log(`Buscando evento con ID: ${eventIdToUpdate}`);
                    existingEvent = await this.eventService.findOne(eventIdToUpdate);
                    this.logger.log(`Evento encontrado por eventId: ${JSON.stringify(existingEvent, null, 2)}`);
                } catch (findError) {
                    this.logger.error(`Error retrieving existing event from appointment.eventId: ${findError.message}`);
                    this.logger.error(`Stack trace: ${findError.stack}`);
                    eventIdToUpdate = null; // Resetear si no se encuentra
                }
            } else {
                this.logger.log(`La cita NO tiene eventId asociado`);
            }

            // Caso 2: Si no encontramos el evento por eventId, intentamos buscar un evento existente por horario y médico
            if (!existingEvent && staffId) {
                this.logger.log(`CASO 2: Buscando evento por horario y médico`);
                try {
                    this.logger.log(`Llamando a findAvailableTurn con staffId: ${staffId}, startDate: ${startDate.toISOString()}, endDate: ${endDate.toISOString()}`);
                    const availableTurn = await this.eventService.findAvailableTurn(staffId, startDate, endDate);

                    if (availableTurn) {
                        this.logger.log(`Evento encontrado por horario y médico: ${JSON.stringify(availableTurn, null, 2)}`);
                        existingEvent = availableTurn;
                        eventIdToUpdate = availableTurn.id;

                        // Si encontramos un evento pero la cita no tiene eventId, actualizamos la cita
                        if (appointment && !appointment.eventId) {
                            try {
                                this.logger.log(`Actualizando cita con el eventId encontrado: ${eventIdToUpdate}`);
                                await this.appointmentService.update(
                                    appointmentData.appointmentId,
                                    { eventId: eventIdToUpdate },
                                    userData
                                );
                                this.logger.log(`Cita actualizada con eventId: ${eventIdToUpdate}`);
                            } catch (updateError) {
                                this.logger.error(`Error updating appointment with found eventId: ${updateError.message}`);
                                this.logger.error(`Stack trace: ${updateError.stack}`);
                            }
                        }
                    } else {
                        this.logger.log(`No se encontró evento por horario y médico`);
                    }
                } catch (searchError) {
                    this.logger.error(`Error searching for existing event: ${searchError.message}`);
                    this.logger.error(`Stack trace: ${searchError.stack}`);
                }
            }

            // Caso 3: Si la cita es resultado de una reprogramación, intentamos obtener el evento de la cita original
            if (!existingEvent && appointment && appointment.rescheduledFromId) {
                this.logger.log(`CASO 3: Buscando evento de la cita original por ser una reprogramación`);
                try {
                    // Obtener la cita original
                    const originalAppointment = await this.appointmentService.findOne(appointment.rescheduledFromId);

                    if (originalAppointment && originalAppointment.eventId) {
                        this.logger.log(`Cita original encontrada con eventId: ${originalAppointment.eventId}`);

                        // Obtener el evento de la cita original
                        try {
                            const originalEvent = await this.eventService.findOne(originalAppointment.eventId);

                            if (originalEvent) {
                                this.logger.log(`Evento de la cita original encontrado: ${JSON.stringify(originalEvent, null, 2)}`);
                                existingEvent = originalEvent;
                                eventIdToUpdate = originalEvent.id;

                                // Actualizar la cita actual con el eventId de la cita original
                                if (!appointment.eventId) {
                                    try {
                                        this.logger.log(`Actualizando cita ${appointmentData.appointmentId} con el eventId de la cita original: ${eventIdToUpdate}`);
                                        await this.appointmentService.update(
                                            appointmentData.appointmentId,
                                            { eventId: eventIdToUpdate },
                                            userData
                                        );
                                        this.logger.log(`Cita actualizada con eventId: ${eventIdToUpdate}`);
                                    } catch (updateError) {
                                        this.logger.error(`Error updating appointment with original eventId: ${updateError.message}`);
                                        this.logger.error(`Stack trace: ${updateError.stack}`);
                                    }
                                }
                            } else {
                                this.logger.log(`No se encontró el evento de la cita original con ID: ${originalAppointment.eventId}`);
                            }
                        } catch (eventError) {
                            this.logger.error(`Error al obtener el evento de la cita original: ${eventError.message}`);
                            this.logger.error(`Stack trace: ${eventError.stack}`);
                        }
                    } else {
                        this.logger.log(`La cita original no tiene eventId o no se encontró`);
                    }
                } catch (appointmentError) {
                    this.logger.error(`Error al obtener la cita original: ${appointmentError.message}`);
                    this.logger.error(`Stack trace: ${appointmentError.stack}`);
                }
            }

            // Si tenemos un evento para actualizar
            if (eventIdToUpdate) {
                this.logger.log(`ACTUALIZANDO: Evento existente con ID ${eventIdToUpdate}`);

                try {
                    // Intentar obtener el evento existente para preservar su título y otros datos
                    if (!existingEvent) {
                        try {
                            this.logger.log(`Obteniendo detalles del evento: ${eventIdToUpdate}`);
                            existingEvent = await this.eventService.findOne(eventIdToUpdate);
                            this.logger.log(`Detalles del evento: ${JSON.stringify(existingEvent, null, 2)}`);
                        } catch (findError) {
                            this.logger.error(`Error retrieving existing event: ${findError.message}`);
                            this.logger.error(`Stack trace: ${findError.stack}`);
                        }
                    }

                    // Preservar el título original si existe
                    const originalTitle = existingEvent?.title || this.createEventTitle(orderDetails, patientDetails);
                    this.logger.log(`Título original: ${originalTitle}`);

                    // Para citas reprogramadas confirmadas, solo actualizamos fechas
                    if (isRescheduledConfirmed) {
                        this.logger.log(`Actualizando solo fechas para cita reprogramada confirmada`);

                        try {
                            const updateResult = await this.eventService.update(
                                eventIdToUpdate,
                                {
                                    start: startDate,
                                    end: endDate,
                                    title: originalTitle,
                                    staffId: staffId,
                                    branchId: branchId
                                    // No actualizamos color ni status para mantener la confirmación
                                },
                                userData
                            );

                            this.logger.log(`Actualización de fechas exitosa: ${JSON.stringify(updateResult, null, 2)}`);
                            return updateResult;
                        } catch (updateError) {
                            this.logger.error(`Error actualizando fechas: ${updateError.message}`);
                            this.logger.error(`Stack trace: ${updateError.stack}`);
                            return null;
                        }
                    }

                    // Intentar actualización directa usando el repositorio para evitar la validación de cambios
                    try {
                        this.logger.log(`Intentando actualización directa a través del repositorio`);

                        // Crear un evento actualizado manteniendo el título original
                        const updatedEvent = {
                            ...existingEvent,
                            color: 'sky',
                            status: EventStatus.CONFIRMED,
                            title: originalTitle,
                            start: startDate,
                            end: endDate,
                            staffId: staffId,
                            branchId: branchId,
                            updatedAt: new Date(),
                            updatedBy: userData.id
                        };

                        // Actualizar directamente en el repositorio
                        const directUpdateResult = await this.eventService.directUpdate(eventIdToUpdate, updatedEvent);

                        if (directUpdateResult) {
                            this.logger.log(`Actualización directa exitosa: ${JSON.stringify(directUpdateResult, null, 2)}`);
                            return {
                                success: true,
                                message: 'Evento actualizado correctamente',
                                data: directUpdateResult
                            };
                        } else {
                            this.logger.warn(`La actualización directa no devolvió resultados`);
                        }
                    } catch (directUpdateError) {
                        this.logger.error(`Error en actualización directa: ${directUpdateError.message}`);
                        this.logger.error(`Stack trace: ${directUpdateError.stack}`);
                        // Continuamos con el método normal si falla la actualización directa
                    }

                    // Si la actualización directa falló, intentamos el método normal
                    this.logger.log(`Intentando actualización normal a través del servicio`);

                    // Preparar los datos para la actualización
                    // Forzar valores diferentes para color y status para asegurar que se actualicen
                    const currentColor = existingEvent?.color || '';
                    const currentStatus = existingEvent?.status || '';

                    this.logger.log(`Color actual: ${currentColor}, Status actual: ${currentStatus}`);

                    // Asegurarnos de que los valores sean diferentes para forzar la actualización
                    const updateEventDto = {
                        // Si el color actual ya es 'sky', usamos temporalmente otro color y luego lo actualizamos de nuevo
                        color: currentColor === 'sky' ? 'blue' : 'sky',
                        // Si el status actual ya es CONFIRMED, usamos temporalmente otro status y luego lo actualizamos de nuevo
                        status: currentStatus === EventStatus.CONFIRMED ? EventStatus.PENDING : EventStatus.CONFIRMED,
                        // Mantenemos el título original
                        title: originalTitle,
                        start: startDate,
                        end: endDate,
                        staffId: staffId,
                        branchId: branchId
                    };

                    this.logger.log(`Datos para actualización: ${JSON.stringify(updateEventDto, null, 2)}`);

                    // Actualizar el evento existente con los nuevos datos
                    this.logger.log(`Llamando a eventService.update con ID: ${eventIdToUpdate}`);
                    const updateResult = await this.eventService.update(
                        eventIdToUpdate,
                        updateEventDto,
                        userData
                    );

                    this.logger.log(`Resultado de la primera actualización: ${JSON.stringify(updateResult, null, 2)}`);

                    // Si usamos valores temporales, ahora actualizamos a los valores finales deseados
                    if (updateResult && updateResult.data) {
                        this.logger.log(`Primera actualización - color: ${updateResult.data.color}, status: ${updateResult.data.status}`);

                        // Siempre hacemos una segunda actualización para asegurarnos de que el color sea 'sky' y el estado sea CONFIRMED
                        try {
                            this.logger.log(`Realizando actualización final a color 'sky' y status CONFIRMED`);
                            const finalUpdate = await this.eventService.update(
                                eventIdToUpdate,
                                {
                                    color: 'sky',
                                    status: EventStatus.CONFIRMED
                                },
                                userData
                            );

                            if (finalUpdate && finalUpdate.data) {
                                this.logger.log(`Actualización final - color: ${finalUpdate.data.color}, status: ${finalUpdate.data.status}`);
                                this.logger.log(`Evento final: ${JSON.stringify(finalUpdate.data, null, 2)}`);
                            }

                            // Usamos el resultado de la actualización final
                            this.logger.log(`Actualización exitosa del evento ${eventIdToUpdate} a color sky y status CONFIRMED`);
                            return finalUpdate;
                        } catch (finalError) {
                            this.logger.error(`Error en actualización final: ${finalError.message}`);
                            this.logger.error(`Stack trace: ${finalError.stack}`);
                            // Si falla la actualización final, devolvemos el resultado de la primera actualización
                            return updateResult;
                        }
                    }

                    this.logger.log(`Actualización exitosa del evento ${eventIdToUpdate}`);
                    return updateResult;
                } catch (updateError) {
                    this.logger.error(`Error updating existing event ${eventIdToUpdate}: ${updateError.message}`);
                    this.logger.error(`Stack trace: ${updateError.stack}`);
                    // Si falla la actualización, intentamos crear uno nuevo pero solo si el error no es por evento no encontrado
                    if (updateError.message && updateError.message.includes('not found')) {
                        this.logger.log(`Evento ${eventIdToUpdate} no encontrado, se creará uno nuevo`);
                        // Continuamos con la creación de un nuevo evento
                    } else {
                        // Para otros errores, podemos decidir no continuar
                        return null;
                    }
                }
            } else {
                this.logger.log(`No se encontró ningún evento existente para actualizar`);
            }

            // Si no hay evento existente o falló la actualización, creamos uno nuevo
            this.logger.log(`CREANDO: Nuevo evento para la cita ${appointmentData.appointmentId}`);

            const createEventDto: CreateEventDto = {
                title: this.createEventTitle(orderDetails, patientDetails),
                color: 'sky',
                type: EventType.CITA,
                status: EventStatus.CONFIRMED,
                start: startDate,
                end: endDate,
                staffId: staffId,
                branchId: branchId,
            };

            this.logger.log(`Datos para crear evento: ${JSON.stringify(createEventDto, null, 2)}`);

            // Crear el evento en el calendario
            try {
                this.logger.log(`Llamando a eventService.create`);
                const result = await this.eventService.create(createEventDto, userData);
                this.logger.log(`Evento creado: ${JSON.stringify(result, null, 2)}`);

                // Actualizar la cita con el ID del evento creado
                if (result && result.data && result.data.id) {
                    const eventId = result.data.id;
                    this.logger.log(`Actualizando cita ${appointmentData.appointmentId} con eventId ${eventId}`);

                    try {
                        const updateResult = await this.appointmentService.update(
                            appointmentData.appointmentId,
                            {
                                eventId: eventId,
                            },
                            userData,
                        );

                        this.logger.log(`Cita actualizada con eventId: ${JSON.stringify(updateResult, null, 2)}`);
                    } catch (updateError) {
                        this.logger.error(`Error updating appointment with eventId: ${updateError.message}`);
                        this.logger.error(`Stack trace: ${updateError.stack}`);
                    }
                }

                return result;
            } catch (error) {
                // Si el error es porque ya existe un evento, lo manejamos de manera especial
                if (error.message && error.message.includes('Ya existe un evento programado')) {
                    this.logger.warn(`Ya existe un evento programado para este horario. Continuando sin crear evento.`);
                    return null;
                }

                this.logger.error(`Error from eventService.create:`, error.stack);
                throw error;
            }
        } catch (error) {
            this.logger.error(`Error creating calendar event for appointment ${appointmentData.appointmentId}:`, error.stack);
            // No lanzamos el error para que no afecte el flujo principal
            return null;
        } finally {
            this.logger.log(`=== FIN: createAppointmentEvent para cita ${appointmentData.appointmentId} ===`);
        }
    }

    /**
     * Crea un título para el evento basado en los datos disponibles
     * @param orderDetails - Detalles de la orden
     * @param patientDetails - Detalles del paciente
     * @returns Título formateado para el evento
     */
    private createEventTitle(orderDetails: any, patientDetails: any): string {
        let eventTitle = `Cita: ${patientDetails.fullName || 'Paciente'}`;

        // Enriquecer el título con información adicional si está disponible
        if (orderDetails.appointmentType) {
            eventTitle = `${orderDetails.appointmentType}: ${patientDetails.fullName || 'Paciente'}`;
        }

        // Agregar DNI al título si está disponible
        if (patientDetails.dni) {
            eventTitle += ` (DNI: ${patientDetails.dni})`;
        }

        return eventTitle;
    }

    /**
     * Obtiene información adicional de la cita si es necesario
     * @param appointmentId - ID de la cita
     * @returns Detalles adicionales de la cita
     */
    private async getAppointmentDetails(appointmentId: string) {
        try {
            // Obtener detalles de la cita usando el servicio de citas
            const appointment = await this.appointmentService.findOne(appointmentId);

            if (appointment) {
                this.logger.log(`Successfully retrieved appointment details for ${appointmentId}`);
                return appointment;
            } else {
                this.logger.warn(`No appointment found with ID ${appointmentId}`);
                return {};
            }
        } catch (error) {
            this.logger.error(`Error getting appointment details for ${appointmentId}:`, error.stack);
            return {};
        }
    }

    private async processMedicalPrescription(order: Order, userId: string) {
        this.logger.log(`[processMedicalPrescription] Starting processing for order ${order.id}`);
        this.logger.log(`[processMedicalPrescription] Order type: ${order.type}`);
        this.logger.log(`[processMedicalPrescription] Raw metadata: ${order.metadata}`);

        let metadata: any;
        try {
            metadata =
                typeof order.metadata === 'string'
                    ? JSON.parse(order.metadata)
                    : order.metadata;
            this.logger.log(`[processMedicalPrescription] Parsed metadata:`, JSON.stringify(metadata, null, 2));
        } catch (error) {
            this.logger.error(`[processMedicalPrescription] Error parsing metadata:`, error);
            throw new Error(
                `Invalid metadata format for order ${order.id}: ${error.message}`,
            );
        }

        this.logger.debug('[processMedicalPrescription] Metadata structure:', JSON.stringify(metadata, null, 2));

        // Extraer datos de la prescripción del metadata usando el nuevo formato
        const orderDetails = metadata?.orderDetails;
        this.logger.log(`[processMedicalPrescription] Order details:`, JSON.stringify(orderDetails, null, 2));

        if (!orderDetails) {
            this.logger.error(`[processMedicalPrescription] No orderDetails found in metadata`);
            throw new Error(`No orderDetails found in order ${order.id}`);
        }

        // Validar que la orden tenga al menos productos o servicios
        if ((!orderDetails.products || orderDetails.products.length === 0) && 
            (!orderDetails.services || orderDetails.services.length === 0)) {
            this.logger.error(`[processMedicalPrescription] Order has no products or services`);
            throw new Error(`Order ${order.id} must have at least products or services`);
        }

        // Preparar userData
        const userData: UserData = {
            id: userId,
            name: 'System',
            email: 'system@system.com',
            phone: '0000000000',
            isSuperAdmin: true,
            roles: [],
        };

        try {
            // Procesar los appointments asociados a la prescripción
            if (orderDetails.services && orderDetails.services.length > 0) {
                this.logger.log(`[processMedicalPrescription] Found ${orderDetails.services.length} services to process`);
                
                for (const service of orderDetails.services) {
                    this.logger.log(`[processMedicalPrescription] Processing service:`, JSON.stringify(service, null, 2));
                    
                    const appointmentId = service.id;
                    if (!appointmentId) {
                        this.logger.warn(`[processMedicalPrescription] Service without appointment ID found in order ${order.id}`);
                        continue;
                    }

                    this.logger.log(`[processMedicalPrescription] Processing appointment ID: ${appointmentId}`);

                    try {
                        // Obtener la cita
                        const appointment = await this.appointmentService.findOne(appointmentId);
                        this.logger.log(`[processMedicalPrescription] Found appointment:`, JSON.stringify(appointment, null, 2));
                        
                        if (!appointment) {
                            this.logger.warn(`[processMedicalPrescription] Appointment ${appointmentId} not found`);
                            continue;
                        }

                        // Actualizar el estado de la cita a CONFIRMED
                        this.logger.log(`[processMedicalPrescription] Updating appointment ${appointmentId} to CONFIRMED status`);
                        const updateResult = await this.appointmentService.update(
                            appointmentId,
                            {
                                status: AppointmentStatus.CONFIRMED,
                            },
                            userData,
                        );
                        this.logger.log(`[processMedicalPrescription] Update result:`, JSON.stringify(updateResult, null, 2));

                        // Crear o actualizar el evento en el calendario
                        try {
                            const appointmentData = {
                                appointmentId: appointment.id,
                                patientId: metadata?.patientDetails?.id || '',
                                staffId: appointment.staffId || orderDetails.staffId || '',
                                serviceId: appointment.serviceId || service.serviceId || '',
                                date: (appointment.start || new Date()).toISOString(),
                                time: '',
                                price: service.servicePrice || 0
                            };

                            this.logger.log(`[processMedicalPrescription] Creating/updating calendar event with data:`, JSON.stringify(appointmentData, null, 2));
                            const eventResult = await this.createAppointmentEvent(order, appointmentData, userData);
                            this.logger.log(`[processMedicalPrescription] Event creation/update result:`, JSON.stringify(eventResult, null, 2));
                        } catch (eventError) {
                            this.logger.error(`[processMedicalPrescription] Error processing event for appointment ${appointmentId}:`, eventError.stack);
                            // No lanzamos el error para que no afecte el flujo principal
                        }
                    } catch (appointmentError) {
                        this.logger.error(`[processMedicalPrescription] Error processing appointment ${appointmentId}:`, appointmentError.stack);
                        // Continuamos con el siguiente appointment
                    }
                }
            } else {
                this.logger.log(`[processMedicalPrescription] No services found in order ${order.id}`);
            }

            // Obtener el branchId del metadata como fallback
            const defaultBranchId = orderDetails.branchId;
            if (!defaultBranchId) {
                throw new Error(`Missing branchId in order ${order.id}`);
            }

            this.logger.log(`[processMedicalPrescription] Processing outgoing operations for prescription medications`);

            // Agrupar productos por storageId
            const productsByStorage: Record<string, { productId: string; quantity: number }[]> = {};

            // Validar stock para todos los productos
            for (const product of orderDetails.products) {
                // Usar el storageId del producto si está disponible, de lo contrario usar el branchId
                const storageId = product.storageId || defaultBranchId;

                await this.validateMedicationStock(order, {
                    productId: product.productId,
                    quantity: product.quantity,
                    storageId: storageId
                });

                // Agrupar productos por storageId para crear outgoings separados
                if (!productsByStorage[storageId]) {
                    productsByStorage[storageId] = [];
                }

                productsByStorage[storageId].push({
                    productId: product.productId,
                    quantity: product.quantity,
                });
            }

            // Crear un outgoing para cada almacén
            await Promise.all(
                Object.entries(productsByStorage).map(async ([storageId, products]) => {
                    const createOutgoingDto: CreateOutgoingDtoStorage = {
                        name: `Prescripción médica ${order.code}`,
                        storageId: storageId,
                        date: new Date(),
                        state: true,
                        movement: products,
                    };

                    await this.outgoingService.createOutgoing(createOutgoingDto, userData);
                })
            );

            this.logger.log(
                `[processMedicalPrescription] Successfully processed all ${orderDetails.products.length} products for prescription order ${order.id}`,
            );

            return { success: true };
        } catch (error) {
            this.logger.error('Error processing prescription:', {
                orderId: order.id,
                error: error.message,
            });

            throw error;
        }
    }

    /**
     * Valida el stock disponible para un medicamento
     */
    private async validateMedicationStock(
        order: Order,
        medication: { productId: string; quantity: number; storageId?: string },
    ) {
        try {
            // Verificar que el medicamento tenga storageId
            const storageId = medication.storageId;
            if (!storageId) {
                throw new Error(`Missing storageId for medication ${medication.productId} in order ${order.id}`);
            }

            this.logger.debug('Validating stock for medication:', {
                storageId,
                productId: medication.productId,
                quantity: medication.quantity,
            });

            const stockActual = await this.stockRepository.getStockByStorageAndProduct(
                storageId,
                medication.productId,
            );

            this.logger.log('stockActual:', stockActual);

            if (!stockActual || stockActual.stock < medication.quantity) {
                throw new Error(
                    `Insufficient stock for medication ${medication.productId} in storage ${storageId}. Required: ${medication.quantity}, Available: ${stockActual ? stockActual.stock : 0}`,
                );
            }
        } catch (error) {
            this.logger.error('Error validating medication stock:', {
                orderId: order.id,
                medicationId: medication.productId,
                error: error.message,
            });
            throw error;
        }
    }
} 