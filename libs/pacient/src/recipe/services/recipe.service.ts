import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RecipeRepository } from '../repositories/recipe.repository';
import { Recipe } from '../entities/recipe.entity';
import { CreateRecipeDto, UpdateRecipeDto, DeleteRecipeDto } from '../dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { recipeErrorMessages } from '../errors/errors-recipe';
import {
  CreateRecipeUseCase,
  UpdateRecipeUseCase,
  DeleteRecipesUseCase,
  ReactivateRecipeUseCase,
} from '../use-cases';

// Constantes para nombres de tablas
const TABLE_NAMES = {
  UPDATE_HISTORIA: 'updateHistoria',
  SUCURSAL: 'sucursal',
  PERSONAL: 'personal',
  PACIENTE: 'paciente',
} as const;

@Injectable()
export class RecipeService {
  private readonly logger = new Logger(RecipeService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly createRecipeUseCase: CreateRecipeUseCase,
    private readonly updateRecipeUseCase: UpdateRecipeUseCase,
    private readonly deleteRecipesUseCase: DeleteRecipesUseCase,
    private readonly reactivateRecipeUseCase: ReactivateRecipeUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Recipe',
      recipeErrorMessages,
    );
  }

  /**
   * Valida las referencias a otras tablas
   */
  private async validateReferences(dto: CreateRecipeDto | UpdateRecipeDto) {
    // Validar UpdateHistoria
    const updateHistoriaExists = await this.recipeRepository.findByIdValidate(
      TABLE_NAMES.UPDATE_HISTORIA,
      dto.updateHistoriaId,
    );
    if (!updateHistoriaExists) {
      throw new BadRequestException(
        `Registro de Actualizacion de Historia Médica no encontrado`,
      );
    }

    // Validar Sucursal
    const sucursalExists = await this.recipeRepository.findByIdValidate(
      TABLE_NAMES.SUCURSAL,
      dto.sucursalId,
    );
    if (!sucursalExists) {
      throw new BadRequestException(`Registro de Sucursal no encontrado`);
    }

    // Validar Personal
    const personalExists = await this.recipeRepository.findByIdValidate(
      TABLE_NAMES.PERSONAL,
      dto.personalId,
    );
    if (!personalExists) {
      throw new BadRequestException(`Registro de Personal no encontrado`);
    }

    // Validar Paciente
    const pacienteExists = await this.recipeRepository.findByIdValidate(
      TABLE_NAMES.PACIENTE,
      dto.pacienteId,
    );
    if (!pacienteExists) {
      throw new BadRequestException(`Registro de Paciente no encontrado`);
    }
  }

  /**
   * Crea una nueva receta médica
   */
  async create(
    createRecipeDto: CreateRecipeDto,
    user: UserData,
  ): Promise<HttpResponse<Recipe>> {
    try {
      // Validar referencias antes de crear
      await this.validateReferences(createRecipeDto);
      return await this.createRecipeUseCase.execute(createRecipeDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza una receta médica existente
   */
  async update(
    id: string,
    updateRecipeDto: UpdateRecipeDto,
    user: UserData,
  ): Promise<HttpResponse<Recipe>> {
    try {
      const currentRecipe = await this.findById(id);

      if (!validateChanges(updateRecipeDto, currentRecipe)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en la receta médica',
          data: currentRecipe,
        };
      }

      // Validar referencias antes de actualizar
      await this.validateReferences(updateRecipeDto);
      return await this.updateRecipeUseCase.execute(id, updateRecipeDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
      throw error;
    }
  }

  /**
   * Busca una receta médica por su ID
   */
  async findOne(id: string): Promise<Recipe> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Obtiene todas las recetas médicas
   */
  async findAll(): Promise<Recipe[]> {
    try {
      return this.recipeRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
      throw error;
    }
  }

  /**
   * Busca una receta médica por su ID
   */
  async findById(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      throw new BadRequestException('Receta médica no encontrada');
    }
    return recipe;
  }

  /**
   * Desactiva múltiples recetas médicas
   */
  async deleteMany(
    deleteRecipeDto: DeleteRecipeDto,
    user: UserData,
  ): Promise<HttpResponse<Recipe[]>> {
    try {
      validateArray(deleteRecipeDto.ids, 'IDs de recetas médicas');
      return await this.deleteRecipesUseCase.execute(deleteRecipeDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
      throw error;
    }
  }

  /**
   * Reactiva múltiples recetas médicas
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Recipe[]>> {
    try {
      validateArray(ids, 'IDs de recetas médicas');
      return await this.reactivateRecipeUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
      throw error;
    }
  }
}
