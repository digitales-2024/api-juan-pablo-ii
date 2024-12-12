import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { Recipe } from '../entities/recipe.entity';
import { RecipeRepository } from '../repositories/recipe.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateRecipeUseCase {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createRecipeDto: CreateRecipeDto,
    user: UserData,
  ): Promise<HttpResponse<Recipe>> {
    const newRecipe = await this.recipeRepository.transaction(async () => {
      // Create recipe
      const recipe = await this.recipeRepository.create({
        updateHistoriaId: createRecipeDto.updateHistoriaId,
        sucursalId: createRecipeDto.sucursalId,
        personalId: createRecipeDto.personalId,
        pacienteId: createRecipeDto.pacienteId,
        fechaRegistro: createRecipeDto.fechaRegistro,
        receta: createRecipeDto.receta,
        descripcion: createRecipeDto.descripcion,
        ordenCompraId: createRecipeDto.ordenCompraId,
      });

      // Register audit
      await this.auditService.create({
        entityId: recipe.id,
        entityType: 'receta',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return recipe;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Receta médica creada exitosamente',
      data: newRecipe,
    };
  }
}
