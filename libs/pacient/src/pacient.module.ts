import { Module } from '@nestjs/common';
import { PacientService } from './services/pacient.service';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PacientController } from './controllers/pacient.controller';
import { PacientRepository } from './repositories/pacient.repository';
import { CreatePacientUseCase } from './use-cases/create-pacient.use-case';
import { UpdatePacientUseCase } from './use-cases/update-pacient.use-case';

@Module({
  controllers: [PacientController],
  imports: [AuditModule],
  providers: [
    PacientService,
    PacientRepository,
    CreatePacientUseCase,
    UpdatePacientUseCase,
  ],
  exports: [PacientModule],
})
export class PacientModule {}
