import { Module } from '@nestjs/common';
import { BillingController } from './controllers/billing.controller';
import { BillingService } from './services/billing.service';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PayModule } from '@pay/pay/pay.module';
import { ProductSaleGenerator } from './generators/product-sale-generator';
import { CreateProductSaleOrderUseCase } from './use-cases/create-product-sale-billing.use-case';
import { InventoryModule } from '@inventory/inventory/inventory.module';
// import { ProductPurchaseGenerator } from './generators/product-purchase-generator';
// import { CreateProductPurchaseOrderUseCase } from './use-cases/create-product-purchase-billing.use-case';
import { StockService } from '@inventory/inventory/stock/services/stock.service';
import { StorageRepository } from '@inventory/inventory/storage/repositories/storage.repository';
import { ServiceModule } from '../services/service.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { PacientModule } from '@pacient/pacient/pacient.module';
import { CreateAppointmentOrderUseCase } from './use-cases/create-appointment-billing.use-case';
import { AppointmentGenerator } from './generators/appointment.generator';

@Module({
  imports: [
    PayModule,
    InventoryModule,
    AuditModule,
    ServiceModule,
    AppointmentsModule,
    PacientModule
  ],
  controllers: [BillingController],
  providers: [
    ProductSaleGenerator,
    // ProductPurchaseGenerator,
    AppointmentGenerator,
    StorageRepository,
    BillingService,
    StockService,
    CreateProductSaleOrderUseCase,
    // CreateProductPurchaseOrderUseCase,
    CreateAppointmentOrderUseCase,
  ],
})
export class BillingModule { }
