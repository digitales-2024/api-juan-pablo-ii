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
    }[];
}

@Injectable()
export class AppointmentEventSubscriber {
    private readonly logger = new Logger(AppointmentEventSubscriber.name);

    constructor(
        private readonly appointmentService: AppointmentService,
        private readonly eventService: EventService,
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
            `Received order.completed event for order: ${payload.order.id}`,
        );

        if (payload.metadata) {
            this.logger.log(`Payment verification metadata:`);
            this.logger.log(`Object:`, payload.metadata);
        }

        try {
            const { order, metadata } = payload;
            const userId = metadata?.verifiedBy;

            this.logger.log(`Order type: ${order.type}`);
            this.logger.log(`Should process appointment: ${this.shouldProcessAppointment(order)}`);

            if (!this.shouldProcessAppointment(order)) {
                this.logger.log(
                    `Order ${order.id} does not require appointment processing`,
                );
                return;
            }

            this.logger.log(
                `Starting appointment processing for order ${order.id}`,
            );

            await this.processAppointmentOrder(order, userId);

            this.logger.log(
                `Successfully processed appointment for order ${order.id}`,
            );
        } catch (error) {
            this.logger.error(
                `Error processing appointment for order ${payload.order.id}:`,
                error.stack,
            );
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

        if (!appointmentData || !appointmentData.appointmentId) {
            this.logger.error(`No valid appointment data found in order ${order.id}`);
            throw new Error(`No valid appointment data found in order ${order.id}`);
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

            // Crear un evento de tipo CITA en el calendario
            try {
                this.logger.log(`Calling createAppointmentEvent for appointment ${appointmentData.appointmentId}`);
                const eventResult = await this.createAppointmentEvent(order, appointmentData, userData);
                if (eventResult) {
                    this.logger.log(`Event created successfully with ID: ${eventResult.data?.id || 'unknown'}`);
                } else {
                    this.logger.warn(`Event creation returned null or undefined`);
                }
            } catch (eventError) {
                this.logger.error(`Error creating event for appointment ${appointmentData.appointmentId}:`, eventError.stack);
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
     * Crea un evento de tipo CITA en el calendario para una cita médica confirmada
     * @param order - Orden de pago
     * @param appointmentData - Datos de la cita
     * @param userData - Datos del usuario
     */
    private async createAppointmentEvent(
        order: Order,
        appointmentData: AppointmentOrderData,
        userData: UserData
    ) {
        this.logger.log(`Starting createAppointmentEvent for appointment ${appointmentData.appointmentId}`);

        try {
            let metadata: any;
            try {
                metadata = typeof order.metadata === 'string'
                    ? JSON.parse(order.metadata)
                    : order.metadata;

                this.logger.log(`Successfully parsed metadata for order ${order.id}`);
            } catch (error) {
                this.logger.error(`Error parsing metadata for order ${order.id}: ${error.message}`);
                throw new Error(`Invalid metadata format for order ${order.id}: ${error.message}`);
            }

            const orderDetails = metadata?.orderDetails || {};
            const patientDetails = metadata?.patientDetails || {};

            this.logger.log(`Order details: ${JSON.stringify(orderDetails)}`);
            this.logger.log(`Patient details: ${JSON.stringify(patientDetails)}`);

            // Intentar obtener información adicional de la cita si es necesario
            let appointmentDetails = await this.getAppointmentDetails(appointmentData.appointmentId);

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

            // Intentar obtener el staffId y branchId directamente de la cita si no están en los metadatos
            let staffId = appointmentData.staffId || orderDetails.staffId || '';
            let branchId = orderDetails.branchId || '';

            // Si aún no tenemos staffId o branchId, intentamos obtenerlos directamente de la cita
            if (!staffId || !branchId) {
                try {
                    const appointment = await this.appointmentService.findOne(appointmentData.appointmentId);
                    if (appointment) {
                        this.logger.log(`Retrieved appointment details: ${JSON.stringify(appointment)}`);

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
                            this.logger.log(`Using start date from appointment: ${startDate}`);
                        }

                        if (appointment.end) {
                            endDate = new Date(appointment.end);
                            this.logger.log(`Using end date from appointment: ${endDate}`);
                        }
                    }
                } catch (error) {
                    this.logger.error(`Error retrieving appointment details: ${error.message}`);
                }
            }

            // Crear el DTO para el evento
            const createEventDto: CreateEventDto = {
                title: `Cita: ${patientDetails.fullName || 'Paciente'}`,
                color: 'blue',
                type: EventType.CITA,
                status: EventStatus.CONFIRMED,
                start: startDate,
                end: endDate,
                staffId: staffId,
                branchId: branchId,
                // Campos opcionales
                staffScheduleId: undefined,
                cancellationReason: undefined
            };

            // Verificar que los campos requeridos estén presentes
            if (!createEventDto.staffId) {
                this.logger.warn(`No staffId found for appointment ${appointmentData.appointmentId}, using default`);
                // En lugar de lanzar un error, podemos usar un ID por defecto o simplemente no crear el evento
                this.logger.warn(`Cannot create event without staffId. Skipping event creation.`);
                return null;
            }

            if (!createEventDto.branchId) {
                this.logger.warn(`No branchId found for appointment ${appointmentData.appointmentId}, using default`);
                // En lugar de lanzar un error, podemos usar un ID por defecto o simplemente no crear el evento
                this.logger.warn(`Cannot create event without branchId. Skipping event creation.`);
                return null;
            }

            // Enriquecer el título con información adicional si está disponible
            if (orderDetails.appointmentType) {
                createEventDto.title = `${orderDetails.appointmentType}: ${patientDetails.fullName || 'Paciente'}`;
            }

            // Agregar DNI al título si está disponible
            if (patientDetails.dni) {
                createEventDto.title += ` (DNI: ${patientDetails.dni})`;
            }

            this.logger.log(`Creating calendar event for appointment ${appointmentData.appointmentId}`);
            this.logger.debug('Event data:', createEventDto);

            // Crear el evento en el calendario
            this.logger.log(`Calling eventService.create with data:`, createEventDto);
            try {
                const result = await this.eventService.create(createEventDto, userData);
                this.logger.log(`Successfully created calendar event for appointment ${appointmentData.appointmentId}`);

                // Actualizar la cita con el ID del evento creado
                if (result && result.data && result.data.id) {
                    const eventId = result.data.id;
                    this.logger.log(`Updating appointment ${appointmentData.appointmentId} with eventId ${eventId}`);

                    try {
                        const updateResult = await this.appointmentService.update(
                            appointmentData.appointmentId,
                            {
                                eventId: eventId,
                            },
                            userData,
                        );

                        this.logger.log(`Successfully updated appointment with eventId`);
                    } catch (updateError) {
                        this.logger.error(`Error updating appointment with eventId: ${updateError.message}`);
                        // No lanzamos el error para que no afecte el flujo principal
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
        }
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
        this.logger.log(`Processing medical prescription order ${order.id}`);

        let metadata: any;
        try {
            metadata =
                typeof order.metadata === 'string'
                    ? JSON.parse(order.metadata)
                    : order.metadata;
        } catch (error) {
            throw new Error(
                `Invalid metadata format for order ${order.id}: ${error.message}`,
            );
        }

        this.logger.debug('Metadata structure:', JSON.stringify(metadata, null, 2));

        // Extraer datos de la prescripción del metadata
        const prescriptionData = metadata?.prescriptionData as PrescriptionOrderData;
        if (!prescriptionData || !prescriptionData.prescriptionId) {
            throw new Error(`No valid prescription data found in order ${order.id}`);
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
            // Aquí iría la lógica para actualizar el estado de la prescripción médica
            // Por ejemplo, marcarla como pagada o dispensada
            this.logger.log(
                `Successfully processed prescription ${prescriptionData.prescriptionId}`,
            );

            // Nota: Aquí se debería implementar la lógica específica para prescripciones médicas
            // cuando esté disponible en el sistema

            return { success: true };
        } catch (error) {
            this.logger.error('Error processing prescription:', {
                orderId: order.id,
                prescriptionId: prescriptionData.prescriptionId,
                error: error.message,
            });
            throw error;
        }
    }
} 