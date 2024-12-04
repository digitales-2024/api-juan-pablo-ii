import { Module } from '@nestjs/common';
import { ScheduleService } from './calendar/services/schedule.service';

@Module({
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
