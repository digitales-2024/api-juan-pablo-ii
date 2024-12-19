import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { OrderRepository } from '../repositories/order.repository';
import { Payment } from '../entities/payment.entity';
import { ProcessPaymentDto } from '../interfaces/dto/process-payment.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { PaymentStatus, PaymentMethod } from '../interfaces/payment.types';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    processPaymentDto: ProcessPaymentDto,
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
          'Solo se pueden procesar pagos pendientes',
        );
      }

      // Validar que el monto coincide con la orden
      const order = await this.orderRepository.findById(payment.orderId);
      if (order.total !== processPaymentDto.amount) {
        throw new BadRequestException(
          'El monto del pago debe coincidir con el total de la orden',
        );
      }

      // Si el método es CASH, no se requiere número de comprobante
      if (
        processPaymentDto.paymentMethod !== PaymentMethod.CASH &&
        !processPaymentDto.voucherNumber
      ) {
        throw new BadRequestException(
          'Se requiere número de comprobante para este método de pago',
        );
      }

      // Actualizar el pago
      const updatedPayment = await this.paymentRepository.update(id, {
        status: PaymentStatus.PROCESSING,
        paymentMethod: processPaymentDto.paymentMethod,
        voucherNumber: processPaymentDto.voucherNumber,
        amount: processPaymentDto.amount,
        date: processPaymentDto.date,
        description: processPaymentDto.description,
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
        message: 'Pago procesado exitosamente',
        data: updatedPayment,
      };
    });
  }
}
