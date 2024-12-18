import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { OrderRepository } from './repositories/order.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { OrderController } from './controllers/order-controller';
import {
  CreateOrderUseCase,
  DeleteOrdersUseCase,
  DeletePaymentsUseCase,
  ReactivateOrdersUseCase,
  ReactivatePaymentsUseCase,
  UpdateOrderUseCase,
} from './use-cases';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PaymentController } from './controllers/payment-controller';
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from './use-cases/update-payment.use-case';

@Module({
  imports: [AuditModule],
  controllers: [OrderController, PaymentController],
  providers: [
    OrderService,
    PaymentService,
    OrderRepository,
    PaymentRepository,
    CreateOrderUseCase,
    UpdateOrderUseCase,
    DeleteOrdersUseCase,
    ReactivateOrdersUseCase,
    CreatePaymentUseCase,
    UpdatePaymentUseCase,
    DeletePaymentsUseCase,
    ReactivatePaymentsUseCase,
  ],
  exports: [OrderService, PaymentService, OrderRepository, PaymentRepository],
})
export class PayModule {}
