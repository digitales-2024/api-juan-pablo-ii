import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TypeStorageService } from '../services/type-storage.service';
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
  CreateTypeStorageDto,
  UpdateTypeStorageDto,
  DeleteTypeStorageDto,
} from '../dto';
import { TypeStorage } from '../entities/type-storage.entity';

/**
 * Controlador REST para gestionar tipos de almacenamiento.
 * Expone endpoints para operaciones CRUD sobre tipos de almacenamiento.
 */
@ApiTags('Type Storage')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'type-storage', version: '1' })
@Auth()
export class TypeStorageController {
  constructor(private readonly typeStorageService: TypeStorageService) {}

  /**
   * Crea un nuevo tipo de almacenamiento
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo de almacenamiento' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de almacenamiento creado exitosamente',
    type: TypeStorage,
  })
  @ApiBadRequestResponse({
    description:
      'Datos de entrada inválidos o tipo de almacenamiento ya existe',
  })
  create(
    @Body() createTypeStorageDto: CreateTypeStorageDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeStorage>> {
    return this.typeStorageService.create(createTypeStorageDto, user);
  }

  /**
   * Obtiene un tipo de almacenamiento por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de almacenamiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de almacenamiento' })
  @ApiOkResponse({
    description: 'Tipo de almacenamiento encontrado',
    type: TypeStorage,
  })
  @ApiNotFoundResponse({
    description: 'Tipo de almacenamiento no encontrado',
  })
  findOne(@Param('id') id: string): Promise<TypeStorage> {
    return this.typeStorageService.findOne(id);
  }

  /**
   * Obtiene todos los tipos de almacenamiento
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de almacenamiento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los tipos de almacenamiento',
    type: [TypeStorage],
  })
  findAll(): Promise<TypeStorage[]> {
    return this.typeStorageService.findAll();
  }

  /**
   * Actualiza un tipo de almacenamiento existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo de almacenamiento existente' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de almacenamiento actualizado exitosamente',
    type: TypeStorage,
  })
  update(
    @Param('id') id: string,
    @Body() updateTypeStorageDto: UpdateTypeStorageDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeStorage>> {
    return this.typeStorageService.update(id, updateTypeStorageDto, user);
  }

  /**
   * Desactiva múltiples tipos de almacenamiento
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples tipos de almacenamiento' })
  @ApiResponse({
    status: 200,
    description: 'Tipos de almacenamiento desactivados exitosamente',
    type: [TypeStorage],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de almacenamiento no existen',
  })
  deleteMany(
    @Body() deleteTypeStorageDto: DeleteTypeStorageDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeStorage[]>> {
    return this.typeStorageService.deleteMany(deleteTypeStorageDto, user);
  }

  /**
   * Reactiva múltiples tipos de almacenamiento
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples tipos de almacenamiento' })
  @ApiOkResponse({
    description: 'Tipos de almacenamiento reactivados exitosamente',
    type: [TypeStorage],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de almacenamiento no existen',
  })
  reactivateAll(
    @Body() deleteTypeStorageDto: DeleteTypeStorageDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeStorage[]>> {
    return this.typeStorageService.reactivateMany(
      deleteTypeStorageDto.ids,
      user,
    );
  }
}