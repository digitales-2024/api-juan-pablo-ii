import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../interfaces/dto';
import { Payment } from '../entities/payment.entity';
import { PaymentRepository } from '../repositories/payment.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createPaymentDto: CreatePaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    const newPayment = await this.paymentRepository.transaction(async () => {
      // Create payment
      const payment = await this.paymentRepository.create({
        orderId: createPaymentDto.orderId,
        amount: createPaymentDto.amount,
        status: createPaymentDto.status || 'PENDING',
        date: createPaymentDto.date || new Date(),
        description: createPaymentDto.description,
        referenceCode: createPaymentDto.referenceCode,
      });

      // Register audit
      await this.auditService.create({
        entityId: payment.id,
        entityType: 'payment',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return payment;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Pago creado exitosamente',
      data: newPayment,
    };
  }
}
