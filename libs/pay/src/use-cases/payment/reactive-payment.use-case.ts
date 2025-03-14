import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Payment } from '../../entities/payment.entity';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivatePaymentsUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Payment[]>> {
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
      success: true,
      message: 'Pagos reactivados exitosamente',
      data: reactivatedPayments,
    };
  }
}
