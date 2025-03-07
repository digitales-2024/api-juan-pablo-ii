import { Module } from '@nestjs/common';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import {
  CreateAppointmentUseCase,
  FindAppointmentsPaginatedUseCase,
  UpdateAppointmentUseCase,
} from './use-cases';
import { AppointmentService } from './services/appointment.service';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentController } from './controllers/appointment.controller';
import { DeleteAppointmentsUseCase } from './use-cases/delete-appointments.use-case';
import { ReactivateAppointmentsUseCase } from './use-cases/reactive-appointments.use-case';
import { EventsModule } from '@calendar/calendar/event/events.module';
import { ServiceModule } from '../services/service.module';

@Module({
  imports: [AuditModule, EventsModule, ServiceModule],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    AppointmentRepository,
    CreateAppointmentUseCase,
    UpdateAppointmentUseCase,
    DeleteAppointmentsUseCase,
    ReactivateAppointmentsUseCase,
    FindAppointmentsPaginatedUseCase
  ],
  exports: [AppointmentService],
})
export class AppointmentsModule { }
