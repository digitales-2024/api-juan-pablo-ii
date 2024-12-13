import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TypeProductService } from '../services/type-product.service';
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
import {
  CreateTypeProductDto,
  UpdateTypeProductDto,
  DeleteTypeProductDto,
} from '../dto';
import { TypeProduct } from '../entities/type-product.entity';

/**
 * Controlador REST para gestionar tipos de productos.
 * Expone endpoints para operaciones CRUD sobre tipos de productos.
 */
@ApiTags('Type Product')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'type-product', version: '1' })
@Auth()
export class TypeProductController {
  constructor(private readonly typeProductService: TypeProductService) {}

  /**
   * Crea un nuevo tipo de producto
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo de producto' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de producto creado exitosamente',
    type: TypeProduct,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o tipo de producto ya existe',
  })
  create(
    @Body() createTypeProductDto: CreateTypeProductDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeProduct>> {
    return this.typeProductService.create(createTypeProductDto, user);
  }

  /**
   * Obtiene un tipo de producto por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de producto' })
  @ApiOkResponse({
    description: 'Tipo de producto encontrado',
    type: TypeProduct,
  })
  @ApiNotFoundResponse({
    description: 'Tipo de producto no encontrado',
  })
  findOne(@Param('id') id: string): Promise<TypeProduct> {
    return this.typeProductService.findOne(id);
  }

  /**
   * Obtiene todos los tipos de productos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los tipos de productos',
    type: [TypeProduct],
  })
  findAll(): Promise<TypeProduct[]> {
    return this.typeProductService.findAll();
  }

  /**
   * Actualiza un tipo de producto existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo de producto existente' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de producto actualizado exitosamente',
    type: TypeProduct,
  })
  update(
    @Param('id') id: string,
    @Body() updateTypeProductDto: UpdateTypeProductDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeProduct>> {
    return this.typeProductService.update(id, updateTypeProductDto, user);
  }

  /**
   * Desactiva múltiples tipos de productos
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples tipos de productos' })
  @ApiResponse({
    status: 200,
    description: 'Tipos de productos desactivados exitosamente',
    type: [TypeProduct],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de productos no existen',
  })
  deleteMany(
    @Body() deleteTypeProductDto: DeleteTypeProductDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeProduct[]>> {
    return this.typeProductService.deleteMany(deleteTypeProductDto, user);
  }

  /**
   * Reactiva múltiples tipos de productos
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples tipos de productos' })
  @ApiOkResponse({
    description: 'Tipos de productos reactivados exitosamente',
    type: [TypeProduct],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de productos no existen',
  })
  reactivateAll(
    @Body() deleteTypeProductDto: DeleteTypeProductDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeProduct[]>> {
    return this.typeProductService.reactivateMany(
      deleteTypeProductDto.ids,
      user,
    );
  }
}
