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
import { BranchRepository } from 'src/modules/branch/repositories/branch.repository';
import { EventController } from './event/controllers/event.controller';
import { EventService } from './event/services/event.service';
import { EventRepository } from './event/repositories/event.repository';
import {
  CreateEventUseCase,
  DeleteEventsUseCase,
  ReactivateEventUseCase,
  UpdateEventUseCase,
} from './event/use-cases';
import { RecurrenceService } from './recurrence/services/recurrence.service';
import { RecurrenceRepository } from './recurrence/repositories/recurrence.repository';
import {
  CreateRecurrenceUseCase,
  DeleteRecurrencesUseCase,
  ReactivateRecurrenceUseCase,
  UpdateRecurrenceUseCase,
} from './recurrence/use-cases';
import { RecurrenceController } from './recurrence/controllers/recurrence.controller';

@Module({
  controllers: [CalendarController, EventController, RecurrenceController],
  imports: [AuditModule],
  providers: [
    //calendario
    CalendarService,
    CalendarRepository,
    CreateCalendarUseCase,
    UpdateCalendarUseCase,
    DeleteCalendarsUseCase,
    ReactivateCalendarUseCase,
    //funcion de validadcion de id de sucursal
    BranchRepository,
    //eventos
    EventService,
    EventRepository,
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventsUseCase,
    ReactivateEventUseCase,
    //recurrencias
    RecurrenceService,
    RecurrenceRepository,
    CreateRecurrenceUseCase,
    UpdateRecurrenceUseCase,
    DeleteRecurrencesUseCase,
    ReactivateRecurrenceUseCase,
  ],
  exports: [ScheduleModule],
})
export class ScheduleModule {}
