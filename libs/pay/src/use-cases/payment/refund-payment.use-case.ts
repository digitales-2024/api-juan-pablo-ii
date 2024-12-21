import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { OrderRepository } from '../../repositories/order.repository';
import { Payment } from '../../entities/payment.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { PaymentStatus, PaymentType } from '../../interfaces/payment.types';
import { OrderStatus } from '../../interfaces/order.types';
import { RefundPaymentDto } from '@pay/pay/interfaces/dto';

@Injectable()
export class RefundPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    refundPaymentDto: RefundPaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    return await this.paymentRepository.transaction(async () => {
      // Validar que el pago existe y está completado

      const payment = await this.paymentRepository.findById(id);

      if (!payment) {
        throw new BadRequestException('Pago no encontrado');
      }
      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException(
          'Solo se pueden reembolsar pagos completados',
        );
      }

      // Validar que el monto a reembolsar no exceda el pago original
      if (refundPaymentDto.amount > payment.amount) {
        throw new BadRequestException(
          'El monto del reembolso no puede exceder el pago original',
        );
      }

      // Actualizar el pago
      const refundedPayment = await this.paymentRepository.update(id, {
        status: PaymentStatus.REFUNDED,
        description: `${payment.description} | Reembolso: ${refundPaymentDto.reason}${
          refundPaymentDto.notes ? ` | Notas: ${refundPaymentDto.notes}` : ''
        }`,
      });

      // Actualizar el estado de la orden asociada
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.REFUNDED,
      });

      // Crear un nuevo pago para registrar el reembolso
      await this.paymentRepository.create({
        orderId: payment.orderId,
        amount: -refundPaymentDto.amount, // Monto negativo para indicar reembolso
        type: PaymentType.REFUND,
        status: PaymentStatus.COMPLETED,
        description: `Reembolso del pago ${payment.id} | Razón: ${refundPaymentDto.reason}`,
        paymentMethod: refundPaymentDto.refundMethod,
        date: new Date(),
        isActive: true,
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
        message: 'Pago reembolsado exitosamente',
        data: refundedPayment,
      };
    });
  }
}
