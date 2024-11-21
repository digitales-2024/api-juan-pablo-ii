import { Module } from '@nestjs/common';
import { MedicalConsultationService } from './medical-consultation.service';

@Module({
  providers: [MedicalConsultationService],
  exports: [MedicalConsultationService],
})
export class MedicalConsultationModule {}
