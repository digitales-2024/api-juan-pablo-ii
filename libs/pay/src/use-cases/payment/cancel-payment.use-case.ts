import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { OrderRepository } from '../../repositories/order.repository';
import { Payment } from '../../entities/payment.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { PaymentStatus } from '../../interfaces/payment.types';
import { OrderStatus } from '../../interfaces/order.types';
import { CancelPaymentDto } from '@pay/pay/interfaces/dto';

@Injectable()
export class CancelPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    cancelPaymentDto: CancelPaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    return await this.paymentRepository.transaction(async () => {
      // Validar que el pago existe y está pendiente
      const payment = await this.paymentRepository.findById(id);
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

      // Actualizar el estado de la orden asociada
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.CANCELLED,
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
        message: 'Pago cancelado exitosamente',
        data: cancelledPayment,
      };
    });
  }
}
