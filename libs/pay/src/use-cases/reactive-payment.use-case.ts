import { HttpStatus, Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Payment } from '../entities/payment.entity';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivatePaymentsUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Payment[]>> {
    // Reactivate payments and register audit
    const reactivatedPayments = await this.paymentRepository.transaction(
      async () => {
        const payments = await this.paymentRepository.reactivateMany(ids);

        // Register audit for each reactivated payment
        await Promise.all(
          payments.map((payment) =>
            this.auditService.create({
              entityId: payment.id,
              entityType: 'payment',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return payments;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Pagos reactivados exitosamente',
      data: reactivatedPayments,
    };
  }
}
