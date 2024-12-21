import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { OrderService } from '@pay/pay/services/order.service';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { CreateProductPurchaseBillingDto } from '../dto/create-product-purchase-billing.dto';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { PaymentService } from '@pay/pay/services/payment.service';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from '@pay/pay/interfaces/payment.types';
import { TypeMovementService } from '@inventory/inventory/type-movement/services/type-movement.service';

@Injectable()
export class CreateProductPurchaseOrderUseCase {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly paymentService: PaymentService,
    private readonly typeMovementService: TypeMovementService,
  ) {}

  async execute(
    createDto: CreateProductPurchaseBillingDto,
    user: UserData,
  ): Promise<HttpResponse<Order>> {
    try {
      // Usar transacción para asegurar atomicidad
      const newOrder = await this.orderRepository.transaction(async () => {
        // Crear la orden usando el servicio de la librería pay
        const order = await this.orderService.createOrder(
          OrderType.PRODUCT_PURCHASE_ORDER,
          {
            ...createDto,
            type: OrderType.PRODUCT_PURCHASE_ORDER,
          },
        );

        // Crear el tipo de movimiento como entrada (isIncoming: true)
        await this.typeMovementService.create(
          {
            orderId: order.id,
            name: OrderType.PRODUCT_PURCHASE_ORDER,
            description: `Movimiento de ingreso por compra - ${order.code}`,
            state: false,
            isIncoming: true, // Este es un movimiento de entrada al inventario
          },
          user,
        );

        // Crear el pago pendiente asociado
        await this.paymentService.create(
          {
            orderId: order.id,
            amount: order.total,
            status: PaymentStatus.PENDING,
            type: PaymentType.REGULAR,
            description: `Pago pendiente por compra de productos - ${order.code}`,
            date: new Date(),
            paymentMethod: PaymentMethod.CASH,
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
        message: 'Orden de compra creada exitosamente',
        data: newOrder,
      };
    } catch (error) {
      throw error;
    }
  }
}
