import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from '@login/login';
import { PrismaModule } from '@prisma/prisma';
import { ClientsModule } from '@clients/clients';
import { ServiceModule } from './modules/services/service.module';
import { BranchModule } from './modules/branch/branch.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { StaffModule } from 'libs/staff/staff.module';
import { PayModule } from '@pay/pay/pay.module';
import { BillingModule } from './modules/billing/billing.module';
import { InventoryModule } from '@inventory/inventory/inventory.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { CalendarModule } from '@calendar/calendar/calendar.module';
import { StaffScheduleModule } from './modules/staff-schedule/staff-schedule.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // optional configuration
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    LoginModule,
    PrismaModule,
    PayModule,
    ClientsModule,
    ServiceModule,
    BranchModule,
    AppointmentsModule,
    StaffModule,
    InventoryModule,
    BillingModule,
    CloudflareModule,
    CalendarModule,
    StaffScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
