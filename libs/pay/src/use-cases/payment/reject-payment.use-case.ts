import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { OrderRepository } from '../../repositories/order.repository';
import { Payment } from '../../entities/payment.entity';
import { RejectPaymentDto } from '../../interfaces/dto/payment/reject-payment.dto';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { PaymentStatus } from '../../interfaces/payment.types';
import { OrderStatus } from '../../interfaces/order.types';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderEvents } from '../../events/order.events';

@Injectable()
export class RejectPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(
    id: string,
    rejectPaymentDto: RejectPaymentDto,
    user: UserData,
  ): Promise<BaseApiResponse<Payment>> {
    const logger = new Logger('RejectPaymentUseCase');
    logger.log(`Starting payment rejection for payment ${id}`);

    return await this.paymentRepository.transaction(async () => {
      // Validar que el pago existe y está en proceso
      const payment = await this.paymentRepository.findById(id);
      logger.log(`Found payment: ${JSON.stringify(payment)}`);

      if (!payment) {
        throw new BadRequestException('Pago no encontrado');
      }
      if (payment.status !== PaymentStatus.PROCESSING) {
        throw new BadRequestException(
          'Solo se pueden rechazar pagos en proceso',
        );
      }

      // Actualizar el pago
      const rejectedPayment = await this.paymentRepository.update(id, {
        status: PaymentStatus.CANCELLED,
        description: `${payment.description} | Rechazo: ${rejectPaymentDto.rejectionReason}`,
      });

      logger.log(
        `Payment updated to CANCELLED: ${JSON.stringify(rejectedPayment)}`,
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
          rejectedBy: user.id,
          rejectionDate: new Date(),
          rejectionReason: rejectPaymentDto.rejectionReason
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
        message: 'Pago rechazado exitosamente',
        data: rejectedPayment,
      };
    });
  }
}
