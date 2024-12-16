import { Injectable } from '@nestjs/common';
import { ServiceBillingGenerator } from '../generators/service-billing.generator';
import { CreateServiceBillingDto } from '../dto/create-service-billing.dto';
import { UserData } from '@login/login/interfaces';
import { OrderService } from '@pay/pay/services/order.service';

@Injectable()
export class BillingService {
  constructor(
    private readonly orderService: OrderService,
    private readonly serviceBillingGenerator: ServiceBillingGenerator,
  ) {
    this.orderService.registerGenerator(this.serviceBillingGenerator);
  }

  async createServiceBilling(dto: CreateServiceBillingDto, user: UserData) {
    return this.orderService.createOrder('SERVICE_BILLING', dto, user);
  }
}
