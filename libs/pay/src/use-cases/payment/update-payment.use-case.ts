import { Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from '../../interfaces/dto';
import { Payment } from '../../entities/payment.entity';
import { PaymentRepository } from '../../repositories/payment.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    user: UserData,
  ): Promise<BaseApiResponse<Payment>> {
    const updatedPayment = await this.paymentRepository.transaction(
      async () => {
        // Update payment
        const payment = await this.paymentRepository.update(id, {
          ...(updatePaymentDto.amount !== undefined && {
            amount: updatePaymentDto.amount,
          }),
          ...(updatePaymentDto.status !== undefined && {
            status: updatePaymentDto.status,
          }),
          ...(updatePaymentDto.description !== undefined && {
            description: updatePaymentDto.description,
          }),
        });

        // Register audit
        await this.auditService.create({
          entityId: payment.id,
          entityType: 'payment',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return payment;
      },
    );

    return {
      success: true,
      message: 'Pago actualizado exitosamente',
      data: updatedPayment,
    };
  }
}
