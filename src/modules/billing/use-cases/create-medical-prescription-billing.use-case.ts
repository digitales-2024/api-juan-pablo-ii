import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { OrderService } from '@pay/pay/services/order.service';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { CreateMedicalPrescriptionBillingDto } from '../dto/create-medical-prescription-billing.dto';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import {
  PaymentMethod,
  PaymentStatus,
} from '@pay/pay/interfaces/payment.types';
import { PaymentService } from '@pay/pay/services/payment.service';
import { TypeMovementService } from '@inventory/inventory/type-movement/services/type-movement.service';

@Injectable()
export class CreateMedicalPrescriptionOrderUseCase {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly paymentService: PaymentService,
    private readonly typeMovementService: TypeMovementService,
  ) {}

  async execute(
    createDto: CreateMedicalPrescriptionBillingDto,
    user: UserData,
  ): Promise<HttpResponse<Order>> {
    try {
      // Usar transacción para asegurar atomicidad entre la creación de la orden y la auditoría
      const newOrder = await this.orderRepository.transaction(async () => {
        // Crear la orden usando el servicio de la librería pay
        const order = await this.orderService.createOrder(
          OrderType.MEDICAL_PRESCRIPTION_ORDER,
          {
            ...createDto,
            type: OrderType.MEDICAL_PRESCRIPTION_ORDER,
          },
        );

        await this.typeMovementService.create(
          {
            orderId: order.id,
            name: OrderType.MEDICAL_PRESCRIPTION_ORDER,
            description: `Movimiento para receta - ${order.code}`,
            state: false,
            isIncoming: true,
          },
          user,
        );

        await this.paymentService.create(
          {
            orderId: order.id,
            amount: order.total,
            status: PaymentStatus.PENDING,
            description: `Pago pendiente para receta médica - ${order.code}`,
            date: new Date(),
            paymentMethod: PaymentMethod.CASH, // Or leave undefined
          },
          user,
        );

        // Registrar la auditoría
        await this.auditService.create({
          entityId: order.id,
          entityType: 'order',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return order;
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Medical prescription order created successfully',
        data: newOrder,
      };
    } catch (error) {
      // El error será manejado por el servicio
      throw error;
    }
  }
}