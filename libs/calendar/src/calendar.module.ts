import { Module } from '@nestjs/common';
import { EventsModule } from './event/events.module';
import { TimeOffModule } from './time-off/time-off.module';
import { AuditModule } from '@login/login/admin/audit/audit.module';

/**
 * Módulo principal del calendario que integra los módulos de eventos y tiempo libre.
 * @module CalendarModule
 */
@Module({
  imports: [
    EventsModule,
    TimeOffModule,
    AuditModule,
  ],
  exports: [
    EventsModule,
    TimeOffModule,
  ],
})
export class CalendarModule {}
