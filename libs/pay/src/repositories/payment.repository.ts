import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma';
import { Payment } from '../entities/payment.entity';
import { PayBaseRepository } from './base.repositoriy';
import { PaymentStatus } from '../interfaces/payment.types';

@Injectable()
export class PaymentRepository extends PayBaseRepository<Payment> {
  constructor(prisma: PrismaService) {
    super(prisma, 'payment');
  }
  /**
   * Busca pagos por estado
   * @param status - Estado de el pago
   * @returns Arreglo de pagos con el estado especificado
   * @throws {BadRequestException} Si hay un error al obtener los pagos
   */
  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.findMany({
      where: { status, isActive: true },
    });
  }
}
