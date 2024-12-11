import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateProductUseCase } from '../use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../use-cases/update-product.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { productErrorMessages } from '../errors/errors-product';
import { DeleteProductDto } from '../dto';
import { DeleteProductsUseCase, ReactivateProductUseCase } from '../use-cases';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductsUseCase: DeleteProductsUseCase,
    private readonly reactivateProductUseCase: ReactivateProductUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Product',
      productErrorMessages,
    );
  }

  /**
   * Crea un nuevo producto
   * @param createProductDto - DTO con los datos para crear el producto
   * @param user - Datos del usuario que realiza la creación
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el producto creado
   * @throws {BadRequestException} Si ya existe un producto con el mismo nombre
   * @throws {Error} Si ocurre un error al crear el producto
   */
  async create(
    createProductDto: CreateProductDto,
    user: UserData,
  ): Promise<HttpResponse<Product>> {
    try {
      // Validar si existe un producto con el mismo nombre
      const nameExists = await this.productRepository.findExistName(
        createProductDto.name,
      );

      if (nameExists) {
        throw new BadRequestException('Ya existe un producto con este nombre');
      }

      return await this.createProductUseCase.execute(createProductDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un producto existente
   * @param id - ID del producto a actualizar
   * @param updateProductDto - DTO con los datos para actualizar el producto
   * @param user - Datos del usuario que realiza la actualización
   * @returns Una promesa que resuelve con la respuesta HTTP que contiene el producto actualizado
   * @throws {BadRequestException} Si ya existe un producto con el mismo nombre
   * @throws {Error} Si ocurre un error al actualizar el producto
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    user: UserData,
  ): Promise<HttpResponse<Product>> {
    try {
      const currentProduct = await this.findById(id);

      if (!validateChanges(updateProductDto, currentProduct)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en el producto',
          data: currentProduct,
        };
      }

      // Validar si existe otro producto con el mismo nombre
      if (updateProductDto.name) {
        const nameExists = await this.productRepository.findExistName(
          updateProductDto.name,
        );
        if (nameExists && currentProduct.name !== updateProductDto.name) {
          throw new BadRequestException(
            'Ya existe un producto con este nombre',
          );
        }
      }

      return await this.updateProductUseCase.execute(
        id,
        updateProductDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Busca un producto por su ID
   * @param id - ID del producto a buscar
   * @returns El producto encontrado
   * @throws {NotFoundException} Si el producto no existe
   */
  async findOne(id: string): Promise<Product> {
    try {
      return this.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todos los productos
   * @returns Una promesa que resuelve con una lista de todos los productos
   * @throws {Error} Si ocurre un error al obtener los productos
   */
  async findAll(): Promise<Product[]> {
    try {
      return this.productRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca un producto por su ID
   * @param id - ID del producto a buscar
   * @returns Una promesa que resuelve con el producto encontrado
   * @throws {BadRequestException} Si el producto no existe
   */
  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new BadRequestException('Producto no encontrado');
    }
    return product;
  }

  /**
   * Desactiva múltiples productos
   * @param deleteProductDto - DTO con los IDs de los productos a desactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los productos desactivados
   * @throws {NotFoundException} Si algún producto no existe
   */
  async deleteMany(
    deleteProductDto: DeleteProductDto,
    user: UserData,
  ): Promise<HttpResponse<Product[]>> {
    try {
      validateArray(deleteProductDto.ids, 'IDs de productos');
      return await this.deleteProductsUseCase.execute(deleteProductDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples productos
   * @param ids - Lista de IDs de los productos a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con los productos reactivados
   * @throws {NotFoundException} Si algún producto no existe
   */
  async reactivateMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Product[]>> {
    try {
      validateArray(ids, 'IDs de productos');
      return await this.reactivateProductUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }
}
