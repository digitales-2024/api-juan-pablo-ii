import { Module } from '@nestjs/common';
import { StaffScheduleService } from './services/staff-schedule.service';
import { StaffScheduleRepository } from './repositories/staff-schedule.repository';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { StaffScheduleController } from './controllers/staff-schedule.controller';
import { CreateStaffScheduleUseCase, DeleteStaffSchedulesUseCase, FindStaffSchedulesByFilterUseCase, ReactivateStaffSchedulesUseCase, UpdateStaffScheduleUseCase } from './use-cases';

@Module({
    imports: [AuditModule],
    controllers: [StaffScheduleController],
    providers: [
        StaffScheduleService,
        StaffScheduleRepository,
        CreateStaffScheduleUseCase,
        UpdateStaffScheduleUseCase,
        DeleteStaffSchedulesUseCase,
        ReactivateStaffSchedulesUseCase,
        FindStaffSchedulesByFilterUseCase
    ],
    exports: [StaffScheduleService],
})
export class StaffScheduleModule { }
