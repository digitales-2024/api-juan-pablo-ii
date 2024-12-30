import { Module } from '@nestjs/common';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { ConsultationController } from './controllers/consultation.controller';
import { ConsultationService } from './services/consultation.service';
import { ConsultationRepository } from './repositories/consultation.repository';
import { CreateConsultationUseCase } from './use-cases';

@Module({
  imports: [AuditModule],
  controllers: [ConsultationController],
  providers: [
    ConsultationService,
    ConsultationRepository,
    CreateConsultationUseCase,

    // Repositories
    // Use Cases
  ],
  exports: [ConsultationModule, ConsultationService],
})
export class ConsultationModule {}
