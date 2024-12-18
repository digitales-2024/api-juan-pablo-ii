import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from '@login/login';
import { PrismaModule } from '@prisma/prisma';
import { ClientsModule } from '@clients/clients';
import { ServiceModule } from './modules/services/service.module';
import { BranchModule } from './modules/branch/branch.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PacientModule } from '@pacient/pacient/pacient.module';
import { StaffModule } from 'libs/staff/staff.module';
import { ScheduleModule } from '@schedule/schedule/schedule.module';
import { PayModule } from '@pay/pay/pay.module';
import { BillingModule } from './modules/billing/billing.module';
import { InventoryModule } from '@inventory/inventory/inventory.module';

@Module({
  imports: [
    LoginModule,
    PrismaModule,
    PayModule,
    ClientsModule,
    ServiceModule,
    BranchModule,
    AppointmentsModule,
    PacientModule,
    StaffModule,
    ScheduleModule,
    InventoryModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
