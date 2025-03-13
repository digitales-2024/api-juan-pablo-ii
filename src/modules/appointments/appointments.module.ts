import { Module } from '@nestjs/common';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import {
  CancelAppointmentUseCase,
  CreateAppointmentUseCase,
  FindAppointmentsPaginatedUseCase,
  NoShowAppointmentUseCase,
  UpdateAppointmentUseCase,
  RefundAppointmentUseCase,
  RescheduleAppointmentUseCase,
} from './use-cases';
import { AppointmentService } from './services/appointment.service';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentController } from './controllers/appointment.controller';
import { DeleteAppointmentsUseCase } from './use-cases/delete-appointments.use-case';
import { ReactivateAppointmentsUseCase } from './use-cases/reactive-appointments.use-case';
import { EventsModule } from '@calendar/calendar/event/events.module';
import { ServiceModule } from '../services/service.module';
import { AppointmentEventSubscriber } from './events/appointment-event.subscriber';
import { InventoryModule } from 'libs/inventory/src/inventory.module';
import { PayModule } from '@pay/pay/pay.module';

@Module({
  imports: [AuditModule, EventsModule, ServiceModule, InventoryModule, PayModule],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    AppointmentRepository,
    CreateAppointmentUseCase,
    UpdateAppointmentUseCase,
    DeleteAppointmentsUseCase,
    ReactivateAppointmentsUseCase,
    FindAppointmentsPaginatedUseCase,
    CancelAppointmentUseCase,
    NoShowAppointmentUseCase,
    RefundAppointmentUseCase,
    AppointmentEventSubscriber,
    RescheduleAppointmentUseCase,
  ],
  exports: [AppointmentService],
})
export class AppointmentsModule { }
