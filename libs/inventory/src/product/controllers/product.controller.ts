import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
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
import { CreateProductDto, UpdateProductDto, DeleteProductDto } from '../dto';
import { Product } from '../entities/product.entity';

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
  @ApiResponse({
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
  ): Promise<HttpResponse<Product>> {
    return this.productService.create(createProductDto, user);
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
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  /**
   * Obtiene todos los productos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los productos',
    type: [Product],
  })
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  /**
   * Actualiza un producto existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto existente' })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
    type: Product,
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Product>> {
    return this.productService.update(id, updateProductDto, user);
  }

  /**
   * Desactiva múltiples productos
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples productos' })
  @ApiResponse({
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
  ): Promise<HttpResponse<Product[]>> {
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
  ): Promise<HttpResponse<Product[]>> {
    return this.productService.reactivateMany(deleteProductDto.ids, user);
  }
}
