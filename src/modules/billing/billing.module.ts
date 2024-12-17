import { Module } from '@nestjs/common';
import { BillingController } from './controllers/billing.controller';
import { BillingService } from './services/billing.service';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PayModule } from '@pay/pay/pay.module';
import { MedicalConsultationGenerator } from './generators/medical-consultation.generator';
import { CreateMedicalConsultationOrderUseCase } from './use-cases/create-medical-consultation-billing.use-case';

@Module({
  imports: [PayModule, AuditModule],
  controllers: [BillingController],
  providers: [
    MedicalConsultationGenerator,
    BillingService,
    CreateMedicalConsultationOrderUseCase,
  ],
})
export class BillingModule {}
