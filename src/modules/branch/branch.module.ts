import { Module } from '@nestjs/common';
import { BranchController } from './controllers/branch.controller';
import { BranchService } from './services/branch.service';
import { BranchRepository } from './repositories/branch.repository';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { CreateBranchUseCase } from './use-cases/create-branch.use-case';
import { UpdateBranchUseCase } from './use-cases/update-branch.use-case';
import { DeleteBranchesUseCase } from './use-cases/delete-branch.use-case';
import { ReactivateBranchesUseCase } from './use-cases/reactive-branch.use-case';

@Module({
  imports: [AuditModule],
  controllers: [BranchController],
  providers: [
    BranchService,
    BranchRepository,
    CreateBranchUseCase,
    UpdateBranchUseCase,
    DeleteBranchesUseCase,
    ReactivateBranchesUseCase,
  ],
  exports: [BranchService],
})
export class BranchModule {}
