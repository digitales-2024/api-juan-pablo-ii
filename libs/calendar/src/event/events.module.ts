import { Module } from '@nestjs/common';
import { EventRepository } from './repositories/event.repository';
import { EventService } from './services/event.service';
import { EventController } from './controllers/event.controller';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { CreateEventUseCase } from './use-cases/create-event.use-case';
import { UpdateEventUseCase } from './use-cases/update-event.use-case';
import {
  DeleteEventUseCase,
  DeleteEventsUseCase,
} from './use-cases/delete-event.use-case';
import { ReactivateEventsUseCase } from './use-cases/reactivate-event.use-case';

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
    DeleteEventUseCase,
    DeleteEventsUseCase,
    ReactivateEventsUseCase,
  ],
  controllers: [EventController],
  exports: [EventService],
})
export class EventsModule {}
