import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../entities/category.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { categoryErrorMessages } from '../errors/errors-category';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoryDto,
} from '../dto';
import {
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoriesUseCase,
  ReactivateCategoryUseCase,
} from '../use-cases';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoriesUseCase: DeleteCategoriesUseCase,
    private readonly reactivateCategoryUseCase: ReactivateCategoryUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Category',
      categoryErrorMessages,
    );
  }

  /**
   * Crea una nueva categoría
   * @param createCategoryDto - DTO con los datos para crear la categoría
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene la categoría creada
   * @throws {Error} Si ocurre un error al crear la categoría
   */
  async create(
    createCategoryDto: CreateCategoryDto,
    user: UserData,
  ): Promise<HttpResponse<Category>> {
    try {
      // Validación de nombre
      const nameExists = await this.findByName(createCategoryDto.name); // Valor a validar
      // Si nameExists contiene algún valor
      if (nameExists && nameExists.length > 0) {
        throw new BadRequestException(
          'Ya existe una categoría con este nombre',
        );
      }
      // Si no existe, continúa con el proceso de creación
      return await this.createCategoryUseCase.execute(createCategoryDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza una categoría existente
   * @param id - ID de la categoría a actualizar
   * @param updateCategoryDto - DTO con los datos para actualizar la categoría
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene la categoría actualizada
   * @throws {Error} Si ocurre un error al actualizar la categoría
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: UserData,
  ): Promise<HttpResponse<Category>> {
    try {
      const currentCategory = await this.findById(id);

      if (!validateChanges(updateCategoryDto, currentCategory)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en la categoría',
          data: currentCategory,
        };
      }
      // Validar si existe otro tipo de producto con el mismo nombre
      const nameExists = await this.findByName(updateCategoryDto.name);
      if (nameExists && nameExists.length > 0 && nameExists[0].id !== id) {
        throw new BadRequestException(
          'Ya existe una categoría con este nombre',
        );
      }
      // fin de la validación
      return await this.updateCategoryUseCase.execute(
        id,
        updateCategoryDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca una categoría por su ID
   * @param id - ID de la categoría a buscar
   * @returns La categoría encontrada
   * @throws {NotFoundException} Si la categoría no existe
   */
  async findOne(id: string): Promise<Category> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todas las categorías
   * @returns Una promesa que resuelve con una lista de todas las categorías
   * @throws {Error} Si ocurre un error al obtener las categorías
   */
  async findAll(): Promise<Category[]> {
    try {
      return this.categoryRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una categoría por su ID
   * @param id - ID de la categoría a buscar
   * @returns Una promesa que resuelve con la categoría encontrada
   * @throws {BadRequestException} Si la categoría no existe
   */
  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new BadRequestException('Categoría no encontrada');
    }
    return category;
  }

  /**
   * Desactiva múltiples categorías
   * @param deleteCategoryDto - DTO con los IDs de las categorías a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las categorías desactivadas
   * @throws {NotFoundException} Si alguna categoría no existe
   */
  async deleteMany(
    deleteCategoryDto: DeleteCategoryDto,
    user: UserData,
  ): Promise<HttpResponse<Category[]>> {
    try {
      validateArray(deleteCategoryDto.ids, 'IDs de categorías');
      return await this.deleteCategoriesUseCase.execute(
        deleteCategoryDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples categorías
   * @param ids - Lista de IDs de las categorías a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las categorías reactivadas
   * @throws {NotFoundException} Si alguna categoría no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Category[]>> {
    try {
      validateArray(ids, 'IDs de categorías');
      return await this.reactivateCategoryUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * @param name El nombre de la categoría a buscar.
   * @returns Una promesa que resuelve al resultado de la búsqueda, que podría ser una categoría o un conjunto de categorías.
   * @throws {BadRequestException} Si ocurre un error durante la búsqueda o si no se encuentra una categoría por el nombre proporcionado.
   */
  async findByName(name: string): Promise<any> {
    try {
      // Realiza la búsqueda de la categoría utilizando el repositorio o el método correspondiente
      return await this.categoryRepository.findByName(name);
      // Si solo se encuentra una categoría, la retornamos
    } catch (error) {
      // Manejo de errores si ocurre algún problema durante la búsqueda
      this.logger.error(
        `Error al buscar la categoría por nombre: ${name}`,
        error.stack,
      );
      throw new BadRequestException('Error al buscar la categoría por nombre');
    }
  }
}
