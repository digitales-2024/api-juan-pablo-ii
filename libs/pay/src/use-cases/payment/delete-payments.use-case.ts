import { HttpStatus, Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Payment } from '../../entities/payment.entity';
import { AuditActionType } from '@prisma/client';
import { DeletePaymentsDto } from '../../interfaces/dto';

@Injectable()
export class DeletePaymentsUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deletePaymentsDto: DeletePaymentsDto,
    user: UserData,
  ): Promise<HttpResponse<Payment[]>> {
    const deletedPayments = await this.paymentRepository.transaction(
      async () => {
        // Perform soft delete and get updated payments
        const payments = await this.paymentRepository.softDeleteMany(
          deletePaymentsDto.ids,
        );

        // Register audit for each deleted payment
        await Promise.all(
          payments.map((payment) =>
            this.auditService.create({
              entityId: payment.id,
              entityType: 'payment',
              action: AuditActionType.DELETE,
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
      message: 'Pagos eliminados exitosamente',
      data: deletedPayments,
    };
  }
}
