import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { OrderRepository } from '../../repositories/order.repository';
import { Payment } from '../../entities/payment.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { PaymentStatus } from '../../interfaces/payment.types';
import { OrderStatus } from '../../interfaces/order.types';
import { CancelPaymentDto } from '@pay/pay/interfaces/dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderEvents } from '../../events/order.events';

@Injectable()
export class CancelPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(
    id: string,
    cancelPaymentDto: CancelPaymentDto,
    user: UserData,
  ): Promise<BaseApiResponse<Payment>> {
    const logger = new Logger('CancelPaymentUseCase');
    logger.log(`Starting payment cancellation for payment ${id}`);

    return await this.paymentRepository.transaction(async () => {
      // Validar que el pago existe y está pendiente
      const payment = await this.paymentRepository.findById(id);
      logger.log(`Found payment: ${JSON.stringify(payment)}`);

      if (!payment) {
        throw new BadRequestException('Pago no encontrado');
      }
      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException(
          'Solo se pueden cancelar pagos pendientes',
        );
      }

      // Actualizar el pago
      const cancelledPayment = await this.paymentRepository.update(id, {
        status: PaymentStatus.CANCELLED,
        description: `${payment.description} | Cancelación: ${cancelPaymentDto.cancellationReason}`,
      });

      logger.log(
        `Payment updated to CANCELLED: ${JSON.stringify(cancelledPayment)}`,
      );

      // Actualizar el estado de la orden asociada
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.CANCELLED,
      });

      // Fetch the complete order
      const order = await this.orderRepository.findById(payment.orderId);
      logger.log(`Order updated to CANCELLED: ${JSON.stringify(order)}`);

      // Emit the order cancelled event
      logger.log(`Emitting OrderEvents.ORDER_CANCELLED for order ${order.id}`);
      this.eventEmitter.emit(OrderEvents.ORDER_CANCELLED, {
        order,
        metadata: {
          paymentId: payment.id,
          cancelledBy: user.id,
          cancellationDate: new Date(),
          cancellationReason: cancelPaymentDto.cancellationReason
        },
      });

      // Registrar auditoría
      await this.auditService.create({
        entityId: payment.id,
        entityType: 'payment',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return {
        success: true,
        message: 'Pago cancelado exitosamente',
        data: cancelledPayment,
      };
    });
  }
}
