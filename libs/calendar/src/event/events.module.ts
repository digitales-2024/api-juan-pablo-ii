import { AuditModule } from "@login/login/admin/audit/audit.module";
import { EventRepository } from "./repositories/event.repository";
import { EventService } from "./services/event.service";
import { CreateEventUseCase } from "./use-cases/create-event.use-case";
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { EventController } from "./controllers/event.controller";
import { UpdateEventUseCase } from "./use-cases";
import { DeleteEventsUseCase } from "./use-cases/delete-events.use-case";
import { ReactivateEventsUseCase } from "./use-cases/reactivate-events.use-case";
import { EventFactory } from "./factories/event.factory";
import { CreateRecurrentEventsUseCase } from "./use-cases/create-recurrent-events.use-case";
import { StaffScheduleModule } from "src/modules/staff-schedule/staff-schedule.module";
import { RecurrenceParser } from "../utils/recurrence-parser";
import { APP_INTERCEPTOR } from "@nestjs/core";

/**
 * Módulo que gestiona los eventos del calendario.
 * @module EventsModule
 */
@Module({
  imports: [AuditModule, StaffScheduleModule],
  providers: [
    EventRepository,
    EventService,
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventsUseCase,
    ReactivateEventsUseCase,
    CreateRecurrentEventsUseCase,
    EventFactory,
    RecurrenceParser,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  controllers: [EventController],
  exports: [EventService],
})
export class EventsModule {}
