import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from '@login/login';
import { PrismaModule } from '@prisma/prisma';
import { ClientsModule } from '@clients/clients';
import { ServiceModule } from './modules/services/service.module';
import { BranchModule } from './modules/branch/branch.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';

@Module({
  imports: [
    LoginModule,
    PrismaModule,
    ClientsModule,
    ServiceModule,
    BranchModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
