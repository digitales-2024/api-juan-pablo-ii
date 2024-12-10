import { HttpStatus, Injectable } from '@nestjs/common';
import { RecipeRepository } from '../repositories/recipe.repository';
import { Recipe } from '../entities/recipe.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivateRecipeUseCase {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Recipe[]>> {
    // Reactivar las recetas y registrar auditoría
    const reactivatedRecipes = await this.recipeRepository.transaction(
      async () => {
        const recipes = await this.recipeRepository.reactivateMany(ids);

        // Registrar auditoría para cada receta reactivada
        await Promise.all(
          recipes.map((recipe) =>
            this.auditService.create({
              entityId: recipe.id,
              entityType: 'receta',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return recipes;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Recetas médicas reactivadas exitosamente',
      data: reactivatedRecipes,
    };
  }
}
