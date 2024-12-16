import { Injectable } from '@nestjs/common';
import { ServiceBillingGenerator } from '../generators/service-billing.generator';
import { CreateServiceBillingDto } from '../dto/create-service-billing.dto';
import { UserData } from '@login/login/interfaces';
import { OrderService } from '@pay/pay/services/order.service';
import { CreateServiceBillingUseCase } from '../use-cases/create-service-billing.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';

@Injectable()
export class BillingService {
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly orderService: OrderService,
    private readonly serviceBillingGenerator: ServiceBillingGenerator,
    private readonly createServiceBillingUseCase: CreateServiceBillingUseCase,
  ) {
    this.orderService.registerGenerator(this.serviceBillingGenerator);
  }

  async createServiceBilling(dto: CreateServiceBillingDto, user: UserData) {
    try {
      await this.createServiceBillingUseCase.execute(dto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }
}
