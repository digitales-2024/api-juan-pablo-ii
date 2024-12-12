import { Module } from '@nestjs/common';
import { PacientService } from './pacient/services/pacient.service';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { PacientController } from './pacient/controllers/pacient.controller';
import { PacientRepository } from './pacient/repositories/pacient.repository';
import {
  CreatePacientUseCase,
  UpdatePacientUseCase,
  DeletePacientsUseCase,
  ReactivatePacientUseCase,
} from './pacient/use-cases';
import { RecipeController } from './recipe/controllers/recipe.controller';
import { RecipeService } from './recipe/services/recipe.service';
import {
  CreateRecipeUseCase,
  DeleteRecipesUseCase,
  ReactivateRecipeUseCase,
  UpdateRecipeUseCase,
} from './recipe/use-cases';
import { RecipeRepository } from './recipe/repositories/recipe.repository';
import { UpHistoryController } from './update-history/controllers/up-history.controller';
import { UpHistoryService } from './update-history/services/up-history.service';
import {
  CreateUpHistoryUseCase,
  DeleteUpHistoriesUseCase,
  ReactivateUpHistoryUseCase,
  UpdateUpHistoryUseCase,
} from './update-history/use-cases';
import { UpHistoryRepository } from './update-history/repositories/up-history.repository';
import { HistoryController } from './history/controllers/history.controller';
import { HistoryService } from './history/services/history.service';
import { HistoryRepository } from './history/repositories/history.repository';
import {
  CreateHistoryUseCase,
  DeleteHistoriesUseCase,
  ReactivateHistoryUseCase,
  UpdateHistoryUseCase,
} from './history/use-cases';

@Module({
  controllers: [
    PacientController,
    RecipeController,
    UpHistoryController,
    HistoryController,
  ],
  imports: [AuditModule],
  providers: [
    //paciente
    PacientService,
    PacientRepository,
    CreatePacientUseCase,
    UpdatePacientUseCase,
    DeletePacientsUseCase,
    ReactivatePacientUseCase,
    //receta
    RecipeService,
    CreateRecipeUseCase,
    UpdateRecipeUseCase,
    DeleteRecipesUseCase,
    ReactivateRecipeUseCase,
    RecipeRepository,
    //historia medica actualizacion
    UpHistoryService,
    UpHistoryRepository,
    CreateUpHistoryUseCase,
    UpdateUpHistoryUseCase,
    DeleteUpHistoriesUseCase,
    ReactivateUpHistoryUseCase,
    // historia medica
    HistoryService,
    HistoryRepository,
    CreateHistoryUseCase,
    UpdateHistoryUseCase,
    DeleteHistoriesUseCase,
    ReactivateHistoryUseCase,
  ],
  exports: [PacientModule],
})
export class PacientModule {}
