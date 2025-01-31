import { AuditModule } from "@login/login/admin/audit/audit.module";
import { EventRepository } from "./repositories/event.repository";
import { EventService } from "./services/event.service";
import { CreateEventUseCase } from "./use-cases/create-event.use-case";
import { Module } from "@nestjs/common";
import { EventController } from "./controllers/event.controller";
import { UpdateEventUseCase } from "./use-cases";
import { DeleteEventsUseCase } from "./use-cases/delete-events.use-case";
import { ReactivateEventsUseCase } from "./use-cases/reactivate-events.use-case";

/**
 * Módulo que gestiona los eventos del calendario.
 * @module EventsModule
 */
@Module({
  imports: [AuditModule],
  providers: [
    EventRepository,
    EventService,
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventsUseCase,
    ReactivateEventsUseCase,
  ],
  controllers: [EventController],
  exports: [EventService],
})
export class EventsModule {}
