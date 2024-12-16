import { Module } from '@nestjs/common';
import { BillingController } from './controllers/billing.controller';
import { ServiceBillingGenerator } from './generators/service-billing.generator';
import { BillingService } from './services/billing.service';
import { CreateServiceBillingUseCase } from './use-cases/create-service-billing.use-case';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PayModule } from '@pay/pay/pay.module';

@Module({
  imports: [PayModule, AuditModule],
  controllers: [BillingController],
  providers: [
    ServiceBillingGenerator,
    BillingService,
    CreateServiceBillingUseCase,
  ],
})
export class BillingModule {}
