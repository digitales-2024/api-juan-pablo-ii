import {
  HttpStatus,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { OrderRepository } from '../../repositories/order.repository';
import { Payment } from '../../entities/payment.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { PaymentStatus } from '../../interfaces/payment.types';
import { OrderStatus } from '../../interfaces/order.types';
import { VerifyPaymentDto } from '@pay/pay/interfaces/dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class VerifyPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    verifyPaymentDto: VerifyPaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    const logger = new Logger('VerifyPaymentUseCase');
    logger.log(`Starting payment verification for payment ${id}`);
    return await this.paymentRepository.transaction(async () => {
      // Validar que el pago existe y está en proceso
      const payment = await this.paymentRepository.findById(id);
      logger.log(`Found payment: ${JSON.stringify(payment)}`);
      if (!payment) {
        throw new BadRequestException('Pago no encontrado');
      }
      if (payment.status !== PaymentStatus.PROCESSING) {
        throw new BadRequestException(
          'Solo se pueden verificar pagos en proceso',
        );
      }

      // Actualizar el pago
      const verifiedPayment = await this.paymentRepository.update(id, {
        status: PaymentStatus.COMPLETED,
        verifiedAt: verifyPaymentDto.verifiedAt || new Date(),
        verifiedBy: user.id,
        description: verifyPaymentDto.verificationNotes
          ? `${payment.description} | Verificación: ${verifyPaymentDto.verificationNotes}`
          : payment.description,
      });

      logger.log(
        `Payment updated to COMPLETED: ${JSON.stringify(verifiedPayment)}`,
      );
      // Actualizar el estado de la orden asociada
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.COMPLETED,
      });

      // Fetch the complete order
      const order = await this.orderRepository.findById(payment.orderId);
      logger.log(`Order updated to COMPLETED: ${JSON.stringify(order)}`);
      // Emit the order completed event
      logger.log(`Emitting OrderEvents.ORDER_COMPLETED for order ${order.id}`);
      this.eventEmitter.emit('order.completed', {
        order,
        metadata: {
          paymentId: payment.id,
          verifiedBy: user.id,
          verificationDate: verifyPaymentDto.verifiedAt || new Date(),
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
        statusCode: HttpStatus.OK,
        message: 'Pago verificado exitosamente',
        data: verifiedPayment,
      };
    });
  }
}
