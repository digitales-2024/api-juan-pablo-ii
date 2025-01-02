import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { OrderService } from '@pay/pay/services/order.service';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { CreateMedicalConsultationBillingDto } from '../dto/create-medical-consultation-billing.dto';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { PaymentService } from '@pay/pay/services/payment.service';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from '@pay/pay/interfaces/payment.types';
import { TypeMovementService } from '@inventory/inventory/type-movement/services/type-movement.service';
import { AppointmentService } from 'src/modules/appointments/services/appointment.service';
import { ConsultationService } from 'libs/consultation/services/consultation.service';

@Injectable()
export class CreateMedicalConsultationOrderUseCase {
  private readonly GENERAL_APPOINTMENT_TYPE_ID =
    '6256febe-9b13-45ea-b805-174dc3b947d2';

  constructor(
    private readonly orderService: OrderService,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly paymentService: PaymentService,
    private readonly typeMovementService: TypeMovementService,
    private readonly appointmentsService: AppointmentService,
    private readonly consultationService: ConsultationService,
  ) {}

  async execute(
    createDto: CreateMedicalConsultationBillingDto,
    user: UserData,
  ): Promise<HttpResponse<Order>> {
    return await this.orderRepository.transaction(async () => {
      // Crear tipo de movimiento
      const movementType = await this.typeMovementService.create(
        {
          name: OrderType.MEDICAL_CONSULTATION_ORDER,
          description: `Medical consultation movement - ${new Date().toISOString()}`,
          state: true,
          isIncoming: false,
          tipoExterno: 'CONSULTATION',
        },
        user,
      );

      // Crear la orden - El generator se encargará de obtener y validar:
      // - Servicio y su precio
      // - Especialidad del servicio
      // - Doctor disponible de la especialidad
      const order = await this.orderService.createOrder(
        OrderType.MEDICAL_CONSULTATION_ORDER,
        {
          ...createDto,
          type: OrderType.MEDICAL_CONSULTATION_ORDER,
          movementTypeId: movementType.data.id,
        },
      );

      // Actualizar el tipo de movimiento con el ID de la orden
      await this.typeMovementService.update(
        movementType.data.id,
        {
          orderId: order.id,
          description: `Medical consultation movement for order ${order.code}`,
        },
        user,
      );

      // Crear el pago pendiente
      await this.paymentService.create(
        {
          orderId: order.id,
          amount: order.total,
          status: PaymentStatus.PENDING,
          type: PaymentType.REGULAR,
          description: `Payment pending for medical consultation - ${order.code}`,
          date: new Date(),
          paymentMethod: createDto.paymentMethod || PaymentMethod.CASH,
        },
        user,
      );

      // Extraer datos de la metadata y crear la cita
      const metadata = order.metadata as any;
      const doctorId = metadata.orderDetails.doctorId;

      // Crear la cita usando el servicio de appointments
      await this.appointmentsService.create(
        {
          tipoCitaMedicaId: this.GENERAL_APPOINTMENT_TYPE_ID,
          personalId: doctorId,
          consultaId: createDto.consultaId,
          date: metadata.orderDetails.consultationDate,
          description: metadata.medicalDetails.description,
        },
        user,
      );

      // TODO: En futuras implementaciones, aquí deberíamos:
      // 1. Bloquear el slot de horario seleccionado en el calendario del doctor
      // 2. Posiblemente enviar notificaciones al doctor y al paciente
      // 3. Actualizar contadores o estadísticas de citas

      // Registrar auditoría
      await this.auditService.create({
        entityId: order.id,
        entityType: 'order',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Medical consultation order created successfully',
        data: order,
      };
    });
  }
}
