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
import { InventoryModule } from '@inventory/inventory/inventory.module';
import { ProductPurchaseGenerator } from './generators/product-purchase-generator';
import { CreateProductPurchaseOrderUseCase } from './use-cases/create-product-purchase-billing.use-case';

@Module({
  imports: [PayModule, InventoryModule, AuditModule],
  controllers: [BillingController],
  providers: [
    MedicalConsultationGenerator,
    MedicalPrescriptionGenerator,
    ProductSaleGenerator,
    ProductPurchaseGenerator,
    BillingService,
    CreateMedicalConsultationOrderUseCase,
    CreateMedicalPrescriptionOrderUseCase,
    CreateProductSaleOrderUseCase,
    CreateProductPurchaseOrderUseCase,
  ],
})
export class BillingModule {}
