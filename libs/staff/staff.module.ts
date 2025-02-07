import { Module } from '@nestjs/common';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { StaffTypeService } from './services/staff-type.service';
import { StaffTypeRepository } from './repositories/staff-type.repository';
import {
  CreateStaffTypeUseCase,
  CreateStaffUseCase,
  DeleteStaffTypeUseCase,
  DeleteStaffUseCase,
  ReactivateStaffTypeUseCase,
  ReactivateStaffUseCase,
  UpdateStaffTypeUseCase,
  UpdateStaffUseCase,
} from './use-cases';
import { StaffService } from './services/staff.service';
import { StaffRepository } from './repositories/staff.repository';
import { StaffController } from './controllers/staff.controller';
import { StaffTypeController } from './controllers/staff-type.controller';

@Module({
  imports: [AuditModule],
  controllers: [StaffTypeController, StaffController],
  providers: [
    // Services
    //
    //

    StaffService,
    StaffRepository,
    CreateStaffUseCase,
    UpdateStaffUseCase,

    StaffTypeService,
    StaffTypeRepository,
    CreateStaffTypeUseCase,
    UpdateStaffTypeUseCase,
    DeleteStaffTypeUseCase,
    ReactivateStaffTypeUseCase,
    DeleteStaffUseCase,
    ReactivateStaffUseCase,

    // Repositories
    // Use Cases
  ],
  exports: [StaffTypeService, StaffService],
})
export class StaffModule {}
