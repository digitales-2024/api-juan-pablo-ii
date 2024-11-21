import { Module } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { RecipeModule } from './recipe/recipe.module';
import { MedicalLeaveModule } from './medical-leave/medical-leave.module';

@Module({
  providers: [PrescriptionService],
  exports: [PrescriptionService],
  imports: [RecipeModule, MedicalLeaveModule],
})
export class PrescriptionModule {}
