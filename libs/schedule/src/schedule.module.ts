import { AuditModule } from '@login/login/admin/audit/audit.module';
import { Module } from '@nestjs/common';
import { CalendarRepository } from './calendar/repositories/calendar.repository';
import {
  CreateCalendarUseCase,
  DeleteCalendarsUseCase,
  ReactivateCalendarUseCase,
  UpdateCalendarUseCase,
} from './calendar/use-cases';
import { CalendarService } from './calendar/services/calendar.service';
import { CalendarController } from './calendar/controllers/calendar.controller';

@Module({
  controllers: [CalendarController],
  imports: [AuditModule],
  providers: [
    CalendarService,
    CalendarRepository,
    CreateCalendarUseCase,
    UpdateCalendarUseCase,
    DeleteCalendarsUseCase,
    ReactivateCalendarUseCase,
  ],
  exports: [ScheduleModule],
})
export class ScheduleModule {}
