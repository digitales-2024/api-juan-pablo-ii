import { Module } from '@nestjs/common';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { ApponitmentUserService } from './appointment-user/services/apponitment-user.service';
import { ApponitmentUserController } from './appointment-user/controllers/apponitment-user.controller';
import { ApponitmentUserRepository } from './appointment-user/repositories/apponitment-user.repository';
import { UpdateApponitmentUserUseCase } from './appointment-user/use-cases';
import { DashboardRepository } from './appointment-user/repositories/dashboard-repository';
import { DashboardService } from './appointment-user/services/dashboard.service';
import { DashboardController } from './appointment-user/controllers/dashboard.controller';

@Module({
  controllers: [ApponitmentUserController, DashboardController],
  providers: [
    ApponitmentUserRepository,
    UpdateApponitmentUserUseCase,
    DashboardRepository,
    DashboardService,
    ApponitmentUserService,
  ],
  imports: [AuditModule],
  exports: [ApponitmentUserService, DashboardService],
})
export class DocAppointmentModule {}
