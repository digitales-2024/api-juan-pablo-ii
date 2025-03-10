import { Module } from '@nestjs/common';
import { PacientService } from './pacient/services/pacient.service';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PacientController } from './pacient/controllers/pacient.controller';
import { PacientRepository } from './pacient/repositories/pacient.repository';
import {
  CreatePatientUseCase,
  UpdatePatientUseCase,
  DeletePatientsUseCase,
  ReactivatePacientUseCase,
} from './pacient/use-cases';
import { PrescriptionController } from './recipe/controllers/recipe.controller';
import { PrescriptionService } from './recipe/services/recipe.service';
import {
  CreatePrescriptionUseCase,
  DeletePrescriptionsUseCase,
  ReactivatePrescriptionUseCase,
  UpdatePrescriptionUseCase,
} from './recipe/use-cases';
import { PrescriptionRepository } from './recipe/repositories/recipe.repository';
import { UpdateHistoryController } from './update-history/controllers/up-history.controller';
import { UpdateHistoryService } from './update-history/services/up-history.service';
import {
  CreateUpdateHistoryUseCase,
  DeleteUpdateHistoriesUseCase,
  ReactivateUpdateHistoryUseCase,
  UpdateUpdateHistoryUseCase,
} from './update-history/use-cases';
import { UpdateHistoryRepository } from './update-history/repositories/up-history.repository';
import { MedicalHistoryController } from './history/controllers/history.controller';
import { MedicalHistoryService } from './history/services/history.service';
import { MedicalHistoryRepository } from './history/repositories/history.repository';
import {
  CreateMedicalHistoryUseCase,
  DeleteMedicalHistoriesUseCase,
  ReactivateMedicalHistoryUseCase,
  UpdateMedicalHistoryUseCase,
} from './history/use-cases';
import { CloudflareModule } from 'src/cloudflare/cloudflare.module';
@Module({
  controllers: [
    PacientController,
    PrescriptionController,
    UpdateHistoryController,
    MedicalHistoryController,
  ],
  imports: [AuditModule, CloudflareModule],
  providers: [
    //paciente
    PacientService,
    PacientRepository,
    CreatePatientUseCase,
    UpdatePatientUseCase,
    DeletePatientsUseCase,
    ReactivatePacientUseCase,
    //receta
    PrescriptionService,
    PrescriptionRepository,
    CreatePrescriptionUseCase,
    UpdatePrescriptionUseCase,
    DeletePrescriptionsUseCase,
    ReactivatePrescriptionUseCase,
    //historia medica actualizacion
    UpdateHistoryService,
    UpdateHistoryRepository,
    CreateUpdateHistoryUseCase,
    UpdateUpdateHistoryUseCase,
    DeleteUpdateHistoriesUseCase,
    ReactivateUpdateHistoryUseCase,
    // historia medica
    MedicalHistoryService,
    MedicalHistoryRepository,
    CreateMedicalHistoryUseCase,
    UpdateMedicalHistoryUseCase,
    DeleteMedicalHistoriesUseCase,
    ReactivateMedicalHistoryUseCase,
  ],
  exports: [PacientService],
})
export class PacientModule {}
