import { Module } from '@nestjs/common';
import { PacientService } from './services/pacient.service';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PacientController } from './controllers/pacient.controller';
import { PacientRepository } from './repositories/pacient.repository';
import {
  CreatePacientUseCase,
  UpdatePacientUseCase,
  DeletePacientsUseCase,
  ReactivatePacientUseCase,
} from './use-cases';

@Module({
  controllers: [PacientController],
  imports: [AuditModule],
  providers: [
    PacientService,
    PacientRepository,
    CreatePacientUseCase,
    UpdatePacientUseCase,
    DeletePacientsUseCase,
    ReactivatePacientUseCase,
  ],
  exports: [PacientModule],
})
export class PacientModule {}
