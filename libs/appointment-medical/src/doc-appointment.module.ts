import { Module } from '@nestjs/common';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { ApponitmentUserService } from './appointment-user/services/apponitment-user.service';
import { ApponitmentUserController } from './appointment-user/controllers/apponitment-user.controller';
import { ApponitmentUserRepository } from './appointment-user/repositories/apponitment-user.repository';
import { UpdateApponitmentUserUseCase } from './appointment-user/use-cases';

@Module({
  controllers: [ApponitmentUserController],
  providers: [
    ApponitmentUserService,
    ApponitmentUserRepository,
    UpdateApponitmentUserUseCase,
  ],
  imports: [AuditModule],
  exports: [ApponitmentUserService],
})
export class DocAppointmentModule {}
