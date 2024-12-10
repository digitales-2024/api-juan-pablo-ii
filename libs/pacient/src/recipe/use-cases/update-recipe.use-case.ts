import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { Recipe } from '../entities/recipe.entity';
import { RecipeRepository } from '../repositories/recipe.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateRecipeUseCase {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateRecipeDto: UpdateRecipeDto,
    user: UserData,
  ): Promise<HttpResponse<Recipe>> {
    const updatedRecipe = await this.recipeRepository.transaction(async () => {
      // Update recipe
      const recipe = await this.recipeRepository.update(id, {
        updateHistoriaId: updateRecipeDto.updateHistoriaId,
        sucursalId: updateRecipeDto.sucursalId,
        personalId: updateRecipeDto.personalId,
        pacienteId: updateRecipeDto.pacienteId,
        fechaRegistro: updateRecipeDto.fechaRegistro,
        receta: updateRecipeDto.receta,
        descripcion: updateRecipeDto.descripcion,
        ordenCompraId: updateRecipeDto.ordenCompraId,
      });

      // Register audit
      await this.auditService.create({
        entityId: recipe.id,
        entityType: 'receta',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return recipe;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Receta médica actualizada exitosamente',
      data: updatedRecipe,
    };
  }
}
