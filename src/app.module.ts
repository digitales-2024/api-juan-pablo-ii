import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from '@login/login';
import { PrismaModule } from '@prisma/prisma';
import { ClientsModule } from '@clients/clients';
import { ServiceModule } from './modules/services/service.module';
import { BranchModule } from './modules/branch/branch.module';
import { PacientModule } from '@pacient/pacient/pacient.module';

@Module({
  imports: [
    LoginModule,
    PrismaModule,
    ClientsModule,
    ServiceModule,
    BranchModule,
    PacientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
