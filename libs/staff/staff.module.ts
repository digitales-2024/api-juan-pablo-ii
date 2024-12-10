import { Module } from '@nestjs/common';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { SpecializationController } from './controllers/specialization.controller';
import { SpecializationService } from './services/specialization.service';
import { SpecializationRepository } from './repositories/specialization.repository';
import {
  CreateSpecializationUseCase,
  CreateStaffUseCase,
  DeleteSpecializationUseCase,
  DeleteStaffUseCase,
  ReactivateSpecializationUseCase,
  ReactivateStaffUseCase,
  UpdateSpecializationUseCase,
  UpdateStaffUseCase,
} from './use-cases';
import { StaffService } from './services/staff.service';
import { StaffRepository } from './repositories/staff.repository';
import { StaffController } from './controllers/staff.controller';

@Module({
  imports: [AuditModule],
  controllers: [SpecializationController, StaffController],
  providers: [
    // Services
    //
    //

    StaffService,
    StaffRepository,
    CreateStaffUseCase,
    UpdateStaffUseCase,

    SpecializationService,
    SpecializationRepository,
    CreateSpecializationUseCase,
    UpdateSpecializationUseCase,
    DeleteSpecializationUseCase,
    ReactivateSpecializationUseCase,
    DeleteStaffUseCase,
    ReactivateStaffUseCase,

    // Repositories
    // Use Cases
  ],
  exports: [SpecializationService, StaffService],
})
export class StaffModule {}
