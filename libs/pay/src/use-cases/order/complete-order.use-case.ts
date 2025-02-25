import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderEvents } from '../../events/order.events';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CompleteOrderUseCase {
  private readonly logger = new Logger(CompleteOrderUseCase.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, user: UserData): Promise<BaseApiResponse<Order>> {
    try {
      this.logger.log(`Completing order ${id}`);

      const order = await this.orderRepository.transaction(async () => {
        const updatedOrder = await this.orderRepository.update(id, {
          status: OrderStatus.COMPLETED,
        });

        await this.auditService.create({
          entityId: id,
          entityType: 'order',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return updatedOrder;
      });

      // Emitir evento específico según el tipo de orden
      switch (order.type) {
        case OrderType.MEDICAL_CONSULTATION_ORDER:
          this.eventEmitter.emit('consultation.completed', { order });
          break;
        case OrderType.PRODUCT_SALE_ORDER:
        case OrderType.PRODUCT_PURCHASE_ORDER:
          this.eventEmitter.emit(OrderEvents.ORDER_COMPLETED, { order });
          break;
        // Agregar más casos según necesidad
      }

      return {
        success: true,
        message: 'Order completed successfully',
        data: order,
      };
    } catch (error) {
      this.logger.error(`Failed to complete order ${id}:`, error.message);
      this.eventEmitter.emit(OrderEvents.ORDER_FAILED, {
        orderId: id,
        error: error.message,
      });
      throw error;
    }
  }
}
