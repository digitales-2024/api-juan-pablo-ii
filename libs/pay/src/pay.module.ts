import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { OrderRepository } from './repositories/order.repository';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  providers: [OrderService, PaymentService, OrderRepository, PaymentRepository],
  exports: [OrderService, PaymentService, OrderRepository, PaymentRepository],
})
export class PayModule {}
