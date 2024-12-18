import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma';
import { Payment } from '../entities/payment.entity';
import { PayBaseRepository } from './base.repositoriy';

@Injectable()
export class PaymentRepository extends PayBaseRepository<Payment> {
  constructor(prisma: PrismaService) {
    super(prisma, 'payment');
  }
}
