import { Module } from '@nestjs/common';
import { MedicalProcedureService } from './medical-procedure.service';

@Module({
  providers: [MedicalProcedureService],
  exports: [MedicalProcedureService],
})
export class MedicalProcedureModule {}
