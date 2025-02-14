import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import { CreateProductDto, UpdateProductDto, DeleteProductDto } from '../dto';
import {
  ActiveProduct,
  Product,
  ProductSearch,
  ProductWithRelations,
} from '../entities/product.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
// import { SearchProductDto } from '../dto/search-product.dto';

/**
 * Controlador REST para gestionar productos.
 * Expone endpoints para operaciones CRUD sobre productos.
 */
@ApiTags('Product')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'product', version: '1' })
@Auth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Crea un nuevo producto
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto' })
  @ApiOkResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o producto ya existe',
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Product>> {
    return this.productService.create(createProductDto, user);
  }

  /**
   * Obtiene todos los productos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiOkResponse({
    status: 200,
    description: 'Lista de todos los productos',
    type: [Product],
  })
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get('/active')
  @ApiOperation({
    summary:
      'Obtener todos los productos activos con informaciòn detallada relevante',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Lista de todos los productos',
    type: [ActiveProduct],
  })
  findAllActive(): Promise<ActiveProduct[]> {
    return this.productService.findAllActive();
  }

  /**
   * Obtiene todos los productos con detalles de sus relaciones
   */
  @Get('/detailed')
  @ApiOperation({
    summary: 'Obtener todos los productos con informaciòn detallada',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Lista de todos los productos',
    type: [ProductWithRelations],
  })
  findAllWithRelations(): Promise<ProductWithRelations[]> {
    return this.productService.findAllWithRelations();
  }

  /**
   * Obtiene un producto por su ID con detalles de sus relaciones
   */
  @Get('detailed/:id')
  @ApiOperation({
    summary: 'Obtener producto por ID con informaciòn detallada anidada',
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiOkResponse({
    description: 'Producto encontrado',
    type: [ProductWithRelations],
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  findOneWithRelations(
    @Param('id') id: string,
  ): Promise<ProductWithRelations[]> {
    return this.productService.findByIdWithRelations(id);
  }

  /**
   * Obtiene un producto por su ID con detalles de sus relaciones
   */
  @Get('search')
  @ApiOperation({
    summary: 'Busqueda rápida de producto por su nombre',
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiOkResponse({
    description: 'Producto encontrado',
    type: [ProductSearch],
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  searchProductByIndexedName(
    @Query('name') name: string,
  ): Promise<ProductSearch[]> {
    return this.productService.searchProductByIndexedName(name);
  }

  /**
   * Obtiene un producto por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiOkResponse({
    description: 'Producto encontrado',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  findOne(@Param('id') id: string): Promise<BaseApiResponse<Product>> {
    return this.productService.findOne(id);
  }

  /**
   * Actualiza un producto existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto existente' })
  @ApiOkResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
    type: Product,
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Product>> {
    return this.productService.update(id, updateProductDto, user);
  }

  /**
   * Desactiva múltiples productos
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples productos' })
  @ApiOkResponse({
    status: 200,
    description: 'Productos desactivados exitosamente',
    type: [Product],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o productos no existen',
  })
  deleteMany(
    @Body() deleteProductDto: DeleteProductDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Product[]>> {
    return this.productService.deleteMany(deleteProductDto, user);
  }

  /**
   * Reactiva múltiples productos
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples productos' })
  @ApiOkResponse({
    description: 'Productos reactivados exitosamente',
    type: [Product],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o productos no existen',
  })
  reactivateAll(
    @Body() deleteProductDto: DeleteProductDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Product[]>> {
    return this.productService.reactivateMany(deleteProductDto.ids, user);
  }
}
