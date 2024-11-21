import { Module } from '@nestjs/common';
import { DocAppointmentService } from './doc-appointment.service';

@Module({
  providers: [DocAppointmentService],
  exports: [DocAppointmentService],
})
export class DocAppointmentModule {}
