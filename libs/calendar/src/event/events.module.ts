import { AuditModule } from "@login/login/admin/audit/audit.module";
import { EventRepository } from "./repositories/event.repository";
import { EventService } from "./services/event.service";
import { CreateEventUseCase } from "./use-cases/create-event.use-case";
import { Module } from "@nestjs/common";
import { EventController } from "./controllers/event.controller";

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
   
  ],
  controllers: [EventController],
  exports: [EventService],
})
export class EventsModule {}
