import { Module } from '@nestjs/common';
import { AppointmentTypeService } from './services/appointment-type.service';
import { AppointmentTypeController } from './controllers/appointment-type.controller';
import { AppointmentTypeRepository } from './repositories/appointment-type.repository';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { CreateAppointmentTypeUseCase } from './use-cases/create-appointment-type.use-case';
import { UpdateAppointmentTypeUseCase } from './use-cases/update-appointment-type.use-case';
import { DeleteAppointmentTypesUseCase } from './use-cases';

@Module({
  imports: [AuditModule],
  controllers: [AppointmentTypeController],
  providers: [
    AppointmentTypeService,
    AppointmentTypeRepository,
    CreateAppointmentTypeUseCase,
    UpdateAppointmentTypeUseCase,
    DeleteAppointmentTypesUseCase,
  ],
  exports: [AppointmentTypeService],
})
export class AppointmentsModule {}
