import { Module, forwardRef } from '@nestjs/common';
import { StaffScheduleService } from './services/staff-schedule.service';
import { StaffScheduleRepository } from './repositories/staff-schedule.repository';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { StaffScheduleController } from './controllers/staff-schedule.controller';
import { CreateStaffScheduleUseCase, DeleteStaffSchedulesUseCase, FindStaffSchedulesByFilterUseCase, ReactivateStaffSchedulesUseCase, UpdateStaffScheduleUseCase } from './use-cases';
import { DeleteEventsByStaffScheduleUseCase } from '@calendar/calendar/event/use-cases/delete-events-by-staff-schedule.use-case';
import { EventsModule } from '@calendar/calendar/event/events.module';
@Module({
    imports: [AuditModule, forwardRef(() => EventsModule)],
    controllers: [StaffScheduleController],
    providers: [
        StaffScheduleService,
        StaffScheduleRepository,
        CreateStaffScheduleUseCase,
        UpdateStaffScheduleUseCase,
        DeleteStaffSchedulesUseCase,
        ReactivateStaffSchedulesUseCase,
        FindStaffSchedulesByFilterUseCase,
        DeleteEventsByStaffScheduleUseCase,
    ],
    exports: [StaffScheduleService],
})
export class StaffScheduleModule { }
