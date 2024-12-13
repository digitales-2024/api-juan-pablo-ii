import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async createPayment(orderId: string, amount: number): Promise<Payment> {
    return this.paymentRepository.create({
      orderId,
      amount,
      status: 'PENDING',
      date: new Date(),
    });
  }
}
