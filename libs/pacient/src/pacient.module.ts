import { Module } from '@nestjs/common';
import { PacientService } from './services/pacient.service';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { BranchController } from './controllers/branch.controller';

@Module({
  controllers: [BranchController],
  imports: [AuditModule],
  providers: [PacientService],
  exports: [PacientService],
})
export class PacientModule {}

/////////////////////

import { BranchRepository } from './repositories/branch.repository';

import { CreateBranchUseCase } from './use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from './use-cases/update-branch.use-case';
import { BranchService } from './services/branch.service';

@Module({
  providers: [
    BranchService,
    BranchRepository,
    CreateBranchUseCase,
    UpdateBranchUseCase,
  ],
  exports: [BranchService],
})
export class BranchModule {}
