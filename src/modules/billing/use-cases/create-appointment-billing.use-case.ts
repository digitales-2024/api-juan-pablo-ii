import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { OrderService } from '@pay/pay/services/order.service';
import { OrderType, OrderStatus } from '@pay/pay/interfaces/order.types';
import { CreateMedicalAppointmentBillingDto } from '../dto/create-medical-appointment-billing.dto';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { PaymentService } from '@pay/pay/services/payment.service';
import {
    PaymentMethod,
    PaymentStatus,
    PaymentType,
} from '@pay/pay/interfaces/payment.types';
import { AppointmentGenerator } from '../generators/appointment.generator';
import { AppointmentService } from 'src/modules/appointments/services/appointment.service';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { PacientService } from '@pacient/pacient/pacient/services/pacient.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class CreateAppointmentOrderUseCase {
    private readonly logger = new Logger(CreateAppointmentOrderUseCase.name);

    constructor(
        private readonly orderService: OrderService,
        private readonly orderRepository: OrderRepository,
        private readonly auditService: AuditService,
        private readonly paymentService: PaymentService,
        private readonly appointmentGenerator: AppointmentGenerator,
        private readonly appointmentService: AppointmentService,
        private readonly pacientService: PacientService,
    ) { }

    async execute(
        createDto: CreateMedicalAppointmentBillingDto,
        user: UserData,
    ): Promise<BaseApiResponse<Order>> {
        return await this.orderRepository.transaction(async () => {
            const appointmentId = createDto.appointmentId;

            // Obtener detalles de la cita, incluyendo paciente, médico y servicio
            const appointment = await this.appointmentService.findOne(appointmentId);
            if (!appointment) {
                throw new BadRequestException(`Cita médica con ID ${appointmentId} no encontrada`);
            }

            // Validar que la cita esté en estado PENDING
            if (appointment.status !== 'PENDING') {
                this.logger.warn(`Intento de generar orden para cita ${appointmentId} con estado ${appointment.status}`);
                throw new BadRequestException(`No se puede generar una orden para una cita que no está en estado PENDING. Estado actual: ${appointment.status}`);
            }

            // Obtener detalles del paciente usando PacientService
            const patient = await this.pacientService.findOne(appointment.patientId);
            if (!patient) {
                throw new BadRequestException(`Paciente con ID ${appointment.patientId} no encontrado`);
            }

            // Crear metadata vacía usando el generador
            const metadata = this.appointmentGenerator.createEmptyMetadata(createDto, patient);

            // Llenar los detalles del paciente
            metadata.patientDetails.fullName = `${patient.name} ${patient.lastName || ''}`.trim(); // Nombre completo
            metadata.patientDetails.dni = patient.dni;
            metadata.patientDetails.address = patient.address;
            metadata.patientDetails.phone = patient.phone;

            // Agregar información importante de la cita a los metadatos
            metadata.orderDetails.staffId = appointment.staffId;
            metadata.orderDetails.branchId = appointment.branchId;
            metadata.orderDetails.serviceId = appointment.serviceId;
            metadata.orderDetails.appointmentStart = appointment.start ? appointment.start.toString() : '';
            metadata.orderDetails.appointmentEnd = appointment.end ? appointment.end.toString() : '';
            metadata.orderDetails.appointmentType = appointment.type;

            // Obtener el precio del servicio asociado a la cita
            const servicePrice = await this.appointmentService.getServicePriceByAppointmentId(appointmentId);
            if (!servicePrice) {
                throw new BadRequestException(`No se pudo obtener el precio del servicio con ID ${appointment.serviceId}`);
            }

            // const staffAppointment = await this.appointmentService.getStaffByAppointmentId(appointmentId);



            // Calcular subtotal, impuestos y total
            const subtotal = servicePrice; // Asumiendo que el precio del servicio es el subtotal
            const tax = subtotal * 0.18; // Por ejemplo, 18% de impuesto
            const total = subtotal + tax;

            // Actualiza el metadata con los valores calculados
            metadata.orderDetails.transactionDetails = {
                subtotal,
                tax,
                total,
            };

            // Log de la metadata completa
            this.logger.log(`Metadata: ${JSON.stringify(metadata)}`);

            const order = await this.orderService.createOrder(OrderType.MEDICAL_APPOINTMENT_ORDER, createDto);

            // Actualizar la orden con la metadata enriquecida
            const updatedOrder = await this.orderRepository.update(order.id, {
                metadata: metadata, // Guardamos la metadata enriquecida
            });

            // Crear pago pendiente asociado a la orden
            await this.paymentService.create(
                {
                    orderId: order.id,
                    amount: order.total, // Usar el total calculado por el generador
                    status: PaymentStatus.PENDING,
                    type: PaymentType.REGULAR,
                    description: `Pending payment for medical appointment billing - ${order.code}`,
                    date: new Date(),
                    paymentMethod: createDto.paymentMethod ?? PaymentMethod.CASH,
                },
                user,
            );

            // Registrar auditoría de la creación de la orden
            await this.auditService.create({
                entityId: order.id,
                entityType: 'order',
                action: AuditActionType.CREATE,
                performedById: user.id,
                createdAt: new Date(),
            });

            return {
                success: true,
                message: 'Medical appointment billing order created successfully',
                data: updatedOrder,
            };
        });
    }
}

