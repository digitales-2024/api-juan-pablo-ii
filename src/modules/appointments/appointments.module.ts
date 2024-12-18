import { Module } from '@nestjs/common';
import { AppointmentTypeService } from './services/appointment-type.service';
import { AppointmentTypeController } from './controllers/appointment-type.controller';
import { AppointmentTypeRepository } from './repositories/appointment-type.repository';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { CreateAppointmentTypeUseCase } from './use-cases/create-appointment-type.use-case';
import { UpdateAppointmentTypeUseCase } from './use-cases/update-appointment-type.use-case';
import {
  CreateAppointmentUseCase,
  DeleteAppointmentTypesUseCase,
  UpdateAppointmentUseCase,
} from './use-cases';
import { AppointmentService } from './services/appointment.service';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentController } from './controllers/appointment.controller';
import { DeleteAppointmentsUseCase } from './use-cases/delete-appointments.use-case';
import { ReactivateAppointmentsUseCase } from './use-cases/reactive-appointments.use-case';

@Module({
  imports: [AuditModule],
  controllers: [AppointmentTypeController, AppointmentController],
  providers: [
    AppointmentTypeService,
    AppointmentService,
    AppointmentRepository,
    AppointmentTypeRepository,
    CreateAppointmentTypeUseCase,
    CreateAppointmentUseCase,
    UpdateAppointmentUseCase,
    UpdateAppointmentTypeUseCase,
    DeleteAppointmentTypesUseCase,
    DeleteAppointmentsUseCase,
    ReactivateAppointmentsUseCase,
  ],
  exports: [AppointmentTypeService, AppointmentService],
})
export class AppointmentsModule {}
