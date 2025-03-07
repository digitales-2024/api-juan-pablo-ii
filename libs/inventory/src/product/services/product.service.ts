import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import {
  ActiveProduct,
  Product,
  ProductSearch,
  ProductWithRelations,
} from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { UserData } from '@login/login/interfaces';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { CreateProductUseCase } from '../use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../use-cases/update-product.use-case';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { productErrorMessages } from '../errors/errors-product';
import { DeleteProductDto } from '../dto';
import { DeleteProductsUseCase, ReactivateProductUseCase } from '../use-cases';
import { CategoryService } from '@inventory/inventory/category/services/category.service';
import { TypeProductService } from '@inventory/inventory/type-product/services/type-product.service';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
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
    private readonly categoryService: CategoryService,
    private readonly typeProductService: TypeProductService,
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
  ): Promise<BaseApiResponse<Product>> {
    try {
      // Validación de nombre de producto
      const nameExists = await this.findByName(createProductDto.name); // Buscar producto por nombre
      if (nameExists) {
        // Si retorna 'true', ya existe el producto
        throw new BadRequestException('Ya existe un producto con este nombre');
      }
      // Validación de id de categoría
      await this.categoryService.findById(createProductDto.categoriaId);
      // Validación de id de typoproducto
      await this.typeProductService.findById(createProductDto.tipoProductoId);
      // Si todas las validaciones pasan, crea el producto
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
  ): Promise<BaseApiResponse<Product>> {
    try {
      const currentProduct = await this.findById(id);

      if (!validateChanges(updateProductDto, currentProduct)) {
        return {
          // statusCode: HttpStatus.OK,
          success: true,
          message: 'No se detectaron cambios en el producto',
          data: currentProduct,
        };
      }

      //TODO: tHINK BETTER THIS  LOGIC ALSO IN CATEGORY
      // Validación de nombre de producto
      // const nameExists = await this.findByName(updateProductDto.name, ); // Buscar producto por nombre
      // if (nameExists) {
      //   // Si retorna 'true', ya existe el producto
      //   throw new BadRequestException('Ya existe un producto con este nombre');
      // }
      // Validación de id de categoría
      await this.categoryService.findById(updateProductDto.categoriaId);
      // Validación de id de typoproducto
      await this.typeProductService.findById(updateProductDto.tipoProductoId);
      // Si todas las validaciones pasan, crea el producto

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
  async findOne(id: string): Promise<BaseApiResponse<Product>> {
    try {
      const product: BaseApiResponse<Product> = await this.findById(id).then(
        (product) => {
          return {
            // statusCode: HttpStatus.OK,
            success: true,
            message: 'Producto encontrado',
            data: product,
          };
        },
      );

      return product;
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
   * Recupera todos los productos con sus categorías y tipos de productos relacionados.
   *
   * @returns {Promise<Product[]>} Una promesa que resuelve a un array de productos con sus categorías y tipos de productos relacionados.
   * @throws Lanzará un error si hay un problema al recuperar los productos.
   */
  async findAllWithRelations(): Promise<ProductWithRelations[]> {
    try {
      const products = await this.productRepository.findManyWithRelations({
        include: {
          categoria: {
            select: {
              name: true,
            },
          },
          tipoProducto: {
            select: {
              name: true,
            },
          },
        },
      });
      return this.productRepository.mapManyToEntities(products);
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

  async findByIdWithRelations(id: string): Promise<ProductWithRelations[]> {
    try {
      const product = await this.productRepository.findOneWithRelations(id, {
        include: {
          categoria: {
            select: {
              name: true,
            },
          },
          tipoProducto: {
            select: {
              name: true,
            },
          },
        },
      });
      if (!product) {
        throw new BadRequestException('Producto no encontrado');
      }
      return [this.productRepository.mapToEntity(product)];
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
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
  ): Promise<BaseApiResponse<Product[]>> {
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
  ): Promise<BaseApiResponse<Product[]>> {
    try {
      validateArray(ids, 'IDs de productos');
      return await this.reactivateProductUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * @param name El nombre del producto.
   * @returns Una promesa que resuelve al resultado de la búsqueda, que podría ser una categoría o un conjunto de categorías.
   * @throws {BadRequestException} Si ocurre un error durante la búsqueda o si no se encuentra una categoría por el nombre proporcionado.
   */
  async findByName(name: string): Promise<boolean> {
    // Realiza la búsqueda de la categoría utilizando el repositorio o el método correspondiente
    const result = await this.productRepository.findByName(name);
    // Usa un ternario para verificar si el array está vacío y devuelve true o false
    return result && result.length > 0 ? true : false;
  }

  /**
   * Recupera el precio de un producto por su ID.
   *
   * @param {string} productId - El identificador único del producto.
   * @returns {Promise<number | null>} Una promesa que resuelve al precio del producto, o null si el producto no se encuentra.
   * @throws Manejará y registrará cualquier error que ocurra durante el proceso de recuperación.
   */
  async getProductPriceById(productId: string): Promise<number | null> {
    try {
      return this.productRepository.getProductPriceById(productId);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async findAllActive(): Promise<ActiveProduct[]> {
    try {
      const products = await this.productRepository.findAllActiveProducts();
      if (!products) {
        throw new BadRequestException('Producto no encontrado');
      }
      return products;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async searchProductByIndexedName(name: string): Promise<ProductSearch[]> {
    try {
      const results =
        name === 'None'
          ? await this.productRepository.bringFirstProducts()
          : await this.productRepository.searchProductByIndexedName(name);

      return results;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async getForSaleProducts() {
    try {
      const products = await this.productRepository.bringForSaleProducts();
      if (!products) {
        throw new BadRequestException('Producto no encontrado');
      }
      return products;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
