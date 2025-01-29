import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
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
import { UserData } from '@login/login/interfaces';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoryDto,
} from '../dto';
import { Category } from '../entities/category.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Controlador REST para gestionar categorías.
 * Expone endpoints para operaciones CRUD sobre categorías.
 */
@ApiTags('Category')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'category', version: '1' })
@Auth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Crea una nueva categoría
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva categoría' })
  @ApiOkResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: BaseApiResponse<Category>,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o categoría ya existe',
  })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Category>> {
    return this.categoryService.create(createCategoryDto, user);
  }

  /**
   * Obtiene todas las categorías
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las categorías',
    type: BaseApiResponse<Category[]>,
  })
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener todas las categorías activas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las categorías activas',
    type: BaseApiResponse<Category[]>,
  })
  findAllActive(): Promise<Category[]> {
    return this.categoryService.findAllActive();
  }

  /**
   * Obtiene una categoría por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiOkResponse({
    description: 'Categoría encontrada',
    type: Category,
  })
  @ApiNotFoundResponse({
    description: 'Categoría no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  /**
   * Actualiza una categoría existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría existente' })
  @ApiOkResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
    type: BaseApiResponse<Category>,
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Category>> {
    return this.categoryService.update(id, updateCategoryDto, user);
  }

  /**
   * Desactiva múltiples categorías
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples categorías' })
  @ApiOkResponse({
    status: 200,
    description: 'Categorías desactivadas exitosamente',
    type: BaseApiResponse<Category[]>,
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o categorías no existen',
  })
  deleteMany(
    @Body() deleteCategoryDto: DeleteCategoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Category[]>> {
    return this.categoryService.deleteMany(deleteCategoryDto, user);
  }

  /**
   * Reactiva múltiples categorías
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples categorías' })
  @ApiOkResponse({
    description: 'Categorías reactivadas exitosamente',
    type: BaseApiResponse<Category[]>,
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o categorías no existen',
  })
  reactivateAll(
    @Body() deleteCategoryDto: DeleteCategoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Category[]>> {
    return this.categoryService.reactivateMany(deleteCategoryDto.ids, user);
  }
}
