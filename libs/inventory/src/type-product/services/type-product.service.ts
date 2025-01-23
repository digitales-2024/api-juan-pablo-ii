import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TypeProductRepository } from '../repositories/type-product.repository';
import {
  TypeProduct,
  TypeProductResponse,
} from '../entities/type-product.entity';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { typeProductErrorMessages } from '../errors/errors-type-product';
import {
  CreateTypeProductDto,
  UpdateTypeProductDto,
  DeleteTypeProductDto,
} from '../dto';
import {
  CreateTypeProductUseCase,
  UpdateTypeProductUseCase,
  DeleteTypeProductsUseCase,
  ReactivateTypeProductUseCase,
} from '../use-cases';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class TypeProductService {
  private readonly logger = new Logger(TypeProductService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly typeProductRepository: TypeProductRepository,
    private readonly createTypeProductUseCase: CreateTypeProductUseCase,
    private readonly updateTypeProductUseCase: UpdateTypeProductUseCase,
    private readonly deleteTypeProductsUseCase: DeleteTypeProductsUseCase,
    private readonly reactivateTypeProductUseCase: ReactivateTypeProductUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'TypeProduct',
      typeProductErrorMessages,
    );
  }

  /**
   * Crea un nuevo tipo de producto
   * @param createTypeProductDto - DTO con los datos para crear el tipo de producto
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el tipo de producto creado
   * @throws {BadRequestException} Si ya existe un tipo de producto con el mismo nombre
   * @throws {Error} Si ocurre un error al crear el tipo de producto
   */
  async create(
    createTypeProductDto: CreateTypeProductDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeProduct>> {
    try {
      // Validación de nombre
      const nameExists = await this.findByName(createTypeProductDto.name);
      if (nameExists) {
        // Si retorna 'true', ya existe el producto
        throw new BadRequestException(
          'Ya existe un tipo producto con este nombre',
        );
      }

      // Si no existe, continúa con el proceso de creación
      return await this.createTypeProductUseCase.execute(
        createTypeProductDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un tipo de producto existente
   * @param id - ID del tipo de producto a actualizar
   * @param updateTypeProductDto - DTO con los datos para actualizar el tipo de producto
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el tipo de producto actualizado
   * @throws {Error} Si ocurre un error al actualizar el tipo de producto
   */
  async update(
    id: string,
    updateTypeProductDto: UpdateTypeProductDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeProduct>> {
    try {
      const currentTypeProduct = await this.findById(id);

      if (!validateChanges(updateTypeProductDto, currentTypeProduct)) {
        return {
          success: true,
          message: 'No se detectaron cambios en el tipo de producto',
          data: currentTypeProduct,
        };
      }

      // Validar si existe otro tipo de producto con el mismo nombre
      const nameExists = await this.findByName(updateTypeProductDto.name); // Buscar producto por nombre
      if (nameExists) {
        // Si retorna 'true', ya existe la categoria
        throw new BadRequestException(
          'Ya existe una categoria con este nombre',
        );
      }
      // fin de la validación
      return await this.updateTypeProductUseCase.execute(
        id,
        updateTypeProductDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un tipo de producto por su ID
   * @param id - ID del tipo de producto a buscar
   * @returns El tipo de producto encontrado
   * @throws {NotFoundException} Si el tipo de producto no existe
   */
  async findOne(id: string): Promise<TypeProduct> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los tipos de productos
   * @returns Una promesa que resuelve con una lista de todos los tipos de productos
   * @throws {Error} Si ocurre un error al obtener los tipos de productos
   */
  async findAll(): Promise<TypeProductResponse[]> {
    try {
      return this.typeProductRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un tipo de producto por su ID
   * @param id - ID del tipo de producto a buscar
   * @returns Una promesa que resuelve con el tipo de producto encontrado
   * @throws {BadRequestException} Si el tipo de producto no existe
   */
  async findById(id: string): Promise<TypeProduct> {
    const typeProduct = await this.typeProductRepository.findById(id);
    if (!typeProduct) {
      throw new BadRequestException('Tipo de producto no encontrado');
    }
    return typeProduct;
  }

  /**
   * Desactiva múltiples tipos de productos
   * @param deleteTypeProductDto - DTO con los IDs de los tipos de productos a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de productos desactivados
   * @throws {NotFoundException} Si algún tipo de producto no existe
   */
  async deleteMany(
    deleteTypeProductDto: DeleteTypeProductDto,
    user: UserData,
  ): Promise<BaseApiResponse<TypeProduct[]>> {
    try {
      validateArray(deleteTypeProductDto.ids, 'IDs de tipos de productos');
      return await this.deleteTypeProductsUseCase.execute(
        deleteTypeProductDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples tipos de productos
   * @param ids - Lista de IDs de los tipos de productos a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los tipos de productos reactivados
   * @throws {NotFoundException} Si algún tipo de producto no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<TypeProduct[]>> {
    try {
      validateArray(ids, 'IDs de tipos de productos');
      return await this.reactivateTypeProductUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * @param name El nombre de la categoría a buscar.
   * @returns Una promesa que resuelve al resultado de la búsqueda, que podría ser una categoría o un conjunto de categorías.
   * @throws {BadRequestException} Si ocurre un error durante la búsqueda o si no se encuentra una categoría por el nombre proporcionado.
   */
  async findByName(name: string): Promise<boolean> {
    // Realiza la búsqueda del tipo de producto por nombre
    const result = await this.typeProductRepository.findByName(name);
    // Usa un ternario para verificar si el array está vacío y devuelve true o false
    return result && result.length > 0 ? true : false;
  }
}
