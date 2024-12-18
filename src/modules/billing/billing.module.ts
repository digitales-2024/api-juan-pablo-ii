import { Module } from '@nestjs/common';
import { BillingController } from './controllers/billing.controller';
import { BillingService } from './services/billing.service';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PayModule } from '@pay/pay/pay.module';
import { MedicalConsultationGenerator } from './generators/medical-consultation.generator';
import { CreateMedicalConsultationOrderUseCase } from './use-cases/create-medical-consultation-billing.use-case';
import { CreateMedicalPrescriptionOrderUseCase } from './use-cases/create-medical-prescription-billing.use-case';
import { MedicalPrescriptionGenerator } from './generators/medical-prescription.generator';
import { ProductSaleGenerator } from './generators/product-sale-generator';
import { CreateProductSaleOrderUseCase } from './use-cases/create-product-sale-billing.use-case';

@Module({
  imports: [PayModule, AuditModule],
  controllers: [BillingController],
  providers: [
    MedicalConsultationGenerator,
    MedicalPrescriptionGenerator,
    ProductSaleGenerator,
    BillingService,
    CreateMedicalConsultationOrderUseCase,
    CreateMedicalPrescriptionOrderUseCase,
    CreateProductSaleOrderUseCase,
  ],
})
export class BillingModule {}
