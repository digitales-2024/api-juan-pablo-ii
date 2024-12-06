import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecipeService } from '../services/recipe.service';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { CreateRecipeDto, UpdateRecipeDto, DeleteRecipeDto } from '../dto';
import { Recipe } from '../entities/recipe.entity';

/**
 * Controlador REST para gestionar recetas médicas.
 * Expone endpoints para operaciones CRUD sobre recetas.
 */
@ApiTags('Recipe')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'receta', version: '1' })
@Auth()
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  /**
   * Crea una nueva receta médica
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva receta médica' })
  @ApiResponse({
    status: 201,
    description: 'Receta médica creada exitosamente',
    type: Recipe,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o receta ya existe',
  })
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Recipe>> {
    return this.recipeService.create(createRecipeDto, user);
  }

  /**
   * Obtiene una receta médica por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener receta médica por ID' })
  @ApiParam({ name: 'id', description: 'ID de la receta médica' })
  @ApiOkResponse({
    description: 'Receta médica encontrada',
    type: Recipe,
  })
  @ApiNotFoundResponse({
    description: 'Receta médica no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Recipe> {
    return this.recipeService.findOne(id);
  }

  /**
   * Obtiene todas las recetas médicas
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las recetas médicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las recetas médicas',
    type: [Recipe],
  })
  findAll(): Promise<Recipe[]> {
    return this.recipeService.findAll();
  }

  /**
   * Actualiza una receta médica existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar receta médica existente' })
  @ApiResponse({
    status: 200,
    description: 'Receta médica actualizada exitosamente',
    type: Recipe,
  })
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Recipe>> {
    return this.recipeService.update(id, updateRecipeDto, user);
  }

  /**
   * Desactiva múltiples recetas médicas
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples recetas médicas' })
  @ApiResponse({
    status: 200,
    description: 'Recetas médicas desactivadas exitosamente',
    type: [Recipe],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o recetas no existen',
  })
  deleteMany(
    @Body() deleteRecipeDto: DeleteRecipeDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Recipe[]>> {
    return this.recipeService.deleteMany(deleteRecipeDto, user);
  }

  /**
   * Reactiva múltiples recetas médicas
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples recetas médicas' })
  @ApiOkResponse({
    description: 'Recetas médicas reactivadas exitosamente',
    type: [Recipe],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o recetas no existen',
  })
  reactivateAll(
    @Body() deleteRecipeDto: DeleteRecipeDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Recipe[]>> {
    return this.recipeService.reactivateMany(deleteRecipeDto.ids, user);
  }
}
