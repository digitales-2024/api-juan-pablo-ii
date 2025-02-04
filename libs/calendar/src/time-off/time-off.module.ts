import { Module } from '@nestjs/common';
import { TimeOffRepository } from './repositories/time-off.repository';
import { TimeOffService } from './services/time-off.service';
import { TimeOffController } from './controllers/time-off.controller';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { CreateTimeOffUseCase } from './use-cases/create-time-off.use-case';
import { UpdateTimeOffUseCase } from './use-cases/update-time-off.use-case';
import { DeleteTimeOffsUseCase } from './use-cases/delete-time-offs.use-case';
import { ReactivateTimeOffsUseCase } from './use-cases/reactivate-time-offs.use-case';

/**
 * Módulo que gestiona las solicitudes de tiempo libre del calendario.
 * @module TimeOffModule
 */
@Module({
  imports: [AuditModule],
  providers: [
    TimeOffRepository,
    TimeOffService,
    CreateTimeOffUseCase,
    UpdateTimeOffUseCase,
    DeleteTimeOffsUseCase,
    ReactivateTimeOffsUseCase,
  ],
  controllers: [TimeOffController],
  exports: [TimeOffService],
})
export class TimeOffModule {}
