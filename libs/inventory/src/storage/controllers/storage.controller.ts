import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StorageService } from '../services/storage.service';
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
import { CreateStorageDto, UpdateStorageDto, DeleteStorageDto } from '../dto';
import { Storage } from '../entities/storage.entity';

/**
 * Controlador REST para gestionar almacenes.
 * Expone endpoints para operaciones CRUD sobre almacenes.
 */
@ApiTags('Almacen')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'storage', version: '1' })
@Auth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Crea un nuevo almacén
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo almacén' })
  @ApiResponse({
    status: 201,
    description: 'Almacén creado exitosamente',
    type: Storage,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o almacén ya existe',
  })
  create(
    @Body() createStorageDto: CreateStorageDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Storage>> {
    return this.storageService.create(createStorageDto, user);
  }

  /**
   * Obtiene un almacén por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener almacén por ID' })
  @ApiParam({ name: 'id', description: 'ID del almacén' })
  @ApiOkResponse({
    description: 'Almacén encontrado',
    type: Storage,
  })
  @ApiNotFoundResponse({
    description: 'Almacén no encontrado',
  })
  findOne(@Param('id') id: string): Promise<Storage> {
    return this.storageService.findOne(id);
  }

  /**
   * Obtiene todos los almacenes
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los almacenes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los almacenes',
    type: [Storage],
  })
  findAll(): Promise<Storage[]> {
    return this.storageService.findAll();
  }

  /**
   * Actualiza un almacén existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar almacén existente' })
  @ApiResponse({
    status: 200,
    description: 'Almacén actualizado exitosamente',
    type: Storage,
  })
  update(
    @Param('id') id: string,
    @Body() updateStorageDto: UpdateStorageDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Storage>> {
    return this.storageService.update(id, updateStorageDto, user);
  }

  /**
   * Desactiva múltiples almacenes
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples almacenes' })
  @ApiResponse({
    status: 200,
    description: 'Almacenes desactivados exitosamente',
    type: [Storage],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o almacenes no existen',
  })
  deleteMany(
    @Body() deleteStorageDto: DeleteStorageDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Storage[]>> {
    return this.storageService.deleteMany(deleteStorageDto, user);
  }

  /**
   * Reactiva múltiples almacenes
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples almacenes' })
  @ApiOkResponse({
    description: 'Almacenes reactivados exitosamente',
    type: [Storage],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o almacenes no existen',
  })
  reactivateAll(
    @Body() deleteStorageDto: DeleteStorageDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Storage[]>> {
    return this.storageService.reactivateMany(deleteStorageDto.ids, user);
  }
}
