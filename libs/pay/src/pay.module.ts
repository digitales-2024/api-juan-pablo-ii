// libs/pay/src/pay.module.ts
import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order-controller';
import { PaymentController } from './controllers/payment-controller';
import { OrderService } from './services/order.service';
import { PaymentService } from './services/payment.service';
import { OrderRepository } from './repositories/order.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import {
  CreateOrderUseCase,
  UpdateOrderUseCase,
  DeleteOrdersUseCase,
  ReactivateOrdersUseCase,
  FindOrdersByStatusUseCase,
  CreatePaymentUseCase,
  UpdatePaymentUseCase,
  DeletePaymentsUseCase,
  ReactivatePaymentsUseCase,
  ProcessPaymentUseCase,
  VerifyPaymentUseCase,
  RejectPaymentUseCase,
  CancelPaymentUseCase,
  FindPaymentsByStatusUseCase,
  RefundPaymentUseCase,
  SubmitDraftOrderUseCase,
  CompleteOrderUseCase,
} from './use-cases';

const orderProviders = [
  OrderService,
  OrderRepository,
  CreateOrderUseCase,
  UpdateOrderUseCase,
  DeleteOrdersUseCase,
  ReactivateOrdersUseCase,
  FindOrdersByStatusUseCase,
  SubmitDraftOrderUseCase,
  CompleteOrderUseCase,
];

const paymentProviders = [
  PaymentService,
  PaymentRepository,
  CreatePaymentUseCase,
  UpdatePaymentUseCase,
  DeletePaymentsUseCase,
  ReactivatePaymentsUseCase,
  ProcessPaymentUseCase,
  VerifyPaymentUseCase,
  RejectPaymentUseCase,
  CancelPaymentUseCase,
  FindPaymentsByStatusUseCase,
  RefundPaymentUseCase,
];

@Module({
  imports: [AuditModule],
  controllers: [OrderController, PaymentController],
  providers: [...orderProviders, ...paymentProviders],
  exports: [OrderService, PaymentService, OrderRepository, PaymentRepository],
})
export class PayModule {}
