import { Module } from '@nestjs/common';
import { WorkingHoursService } from './working-hours.service';

@Module({
  providers: [WorkingHoursService],
  exports: [WorkingHoursService],
})
export class WorkingHoursModule {}
