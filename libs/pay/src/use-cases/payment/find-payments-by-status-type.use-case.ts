import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../repositories/payment.repository';
import { Payment } from '../../entities/payment.entity';
import { PaymentCalculations } from '../../utils/payment-calculation';
import { FindPaymentsQueryDto } from '../../interfaces/dto';

@Injectable()
export class FindPaymentsByStatusUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(query: FindPaymentsQueryDto): Promise<{
    payments: Payment[];
    typeStats: any;
  }> {
    // Construir el where dinámicamente
    const where = {
      status: query.status,
      isActive: true,
      ...(query.type && { type: query.type }), // Solo incluir type si se proporciona
    };

    // Obtener los pagos con sus relaciones
    const payments = await this.paymentRepository.findMany({
      where,
      include: {
        order: true, // Incluir la orden relacionada
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const typeStats = PaymentCalculations.getPaymentStatsByType(
      payments,
      query.type,
    );

    return {
      payments,
      typeStats,
    };
  }
}
