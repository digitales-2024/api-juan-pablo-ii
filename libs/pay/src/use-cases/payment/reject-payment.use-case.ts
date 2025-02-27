import { Injectable, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class RejectPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    rejectPaymentDto: RejectPaymentDto,
    user: UserData,
  ): Promise<BaseApiResponse<Payment>> {
    return await this.paymentRepository.transaction(async () => {
      // Validar que el pago existe y está en proceso
      const payment = await this.paymentRepository.findById(id);
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
        success: true,
        message: 'Pago rechazado exitosamente',
        data: rejectedPayment,
      };
    });
  }
}
