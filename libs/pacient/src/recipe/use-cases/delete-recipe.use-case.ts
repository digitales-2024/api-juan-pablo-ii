import { HttpStatus, Injectable } from '@nestjs/common';
import { RecipeRepository } from '../repositories/recipe.repository';
import { Recipe } from '../entities/recipe.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteRecipeDto } from '../dto/delete-recipe.dto';

@Injectable()
export class DeleteRecipesUseCase {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteRecipesDto: DeleteRecipeDto,
    user: UserData,
  ): Promise<HttpResponse<Recipe[]>> {
    const deletedRecipes = await this.recipeRepository.transaction(async () => {
      // Realiza el soft delete y obtiene las recetas actualizadas
      const recipes = await this.recipeRepository.softDeleteMany(
        deleteRecipesDto.ids,
      );

      // Registra la auditoría para cada receta eliminada
      await Promise.all(
        recipes.map((recipe) =>
          this.auditService.create({
            entityId: recipe.id,
            entityType: 'receta',
            action: AuditActionType.DELETE,
            performedById: user.id,
            createdAt: new Date(),
          }),
        ),
      );

      return recipes;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Recetas médicas eliminadas exitosamente',
      data: deletedRecipes,
    };
  }
}
