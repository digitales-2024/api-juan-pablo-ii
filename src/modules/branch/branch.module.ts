import { Module } from '@nestjs/common';
import { BranchController } from './controllers/branch.controller';
import { BranchService } from './services/branch.service';
import { BranchRepository } from './repositories/branch.repository';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { CreateBranchUseCase } from './use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from './use-cases/update-branch.use-case';

@Module({
  imports: [AuditModule],
  controllers: [BranchController],
  providers: [
    BranchService,
    BranchRepository,
    CreateBranchUseCase,
    UpdateBranchUseCase,
  ],
  exports: [BranchService],
})
export class BranchModule {}
