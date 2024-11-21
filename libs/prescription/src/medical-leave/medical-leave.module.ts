import { Module } from '@nestjs/common';
import { MedicalLeaveService } from './medical-leave.service';
import { MedicalLeaveController } from './medical-leave.controller';

@Module({
  controllers: [MedicalLeaveController],
  providers: [MedicalLeaveService],
})
export class MedicalLeaveModule {}
