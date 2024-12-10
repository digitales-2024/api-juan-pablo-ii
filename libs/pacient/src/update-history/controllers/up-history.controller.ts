import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UpHistoryService } from '../services/up-history.service';
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
  CreateUpHistoryDto,
  UpdateUpHistoryDto,
  DeleteUpHistoryDto,
} from '../dto';
import { UpHistory } from '../entities/up-history.entity';

/**
 * Controlador REST para gestionar actualizaciones de historias médicas.
 * Expone endpoints para operaciones CRUD sobre actualizaciones.
 */
@ApiTags('Update Medical history')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'update-historia', version: '1' })
@Auth()
export class UpHistoryController {
  constructor(private readonly upHistoryService: UpHistoryService) {}

  /**
   * Crea una nueva actualización de historia médica
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva actualización de historia médica' })
  @ApiResponse({
    status: 201,
    description: 'Actualización de historia médica creada exitosamente',
    type: UpHistory,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o actualización ya existe',
  })
  create(
    @Body() createUpHistoryDto: CreateUpHistoryDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<UpHistory>> {
    return this.upHistoryService.create(createUpHistoryDto, user);
  }

  /**
   * Obtiene una actualización de historia médica por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener actualización de historia médica por ID' })
  @ApiParam({ name: 'id', description: 'ID de la actualización' })
  @ApiOkResponse({
    description: 'Actualización de historia médica encontrada',
    type: UpHistory,
  })
  @ApiNotFoundResponse({
    description: 'Actualización de historia médica no encontrada',
  })
  findOne(@Param('id') id: string): Promise<UpHistory> {
    return this.upHistoryService.findOne(id);
  }

  /**
   * Obtiene todas las actualizaciones de historias médicas
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las actualizaciones de historias médicas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las actualizaciones de historias médicas',
    type: [UpHistory],
  })
  findAll(): Promise<UpHistory[]> {
    return this.upHistoryService.findAll();
  }

  /**
   * Actualiza una actualización de historia médica existente
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar actualización de historia médica existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Actualización de historia médica actualizada exitosamente',
    type: UpHistory,
  })
  update(
    @Param('id') id: string,
    @Body() updateUpHistoryDto: UpdateUpHistoryDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<UpHistory>> {
    return this.upHistoryService.update(id, updateUpHistoryDto, user);
  }

  /**
   * Desactiva múltiples actualizaciones de historias médicas
   */
  @Delete('remove/all')
  @ApiOperation({
    summary: 'Desactivar múltiples actualizaciones de historias médicas',
  })
  @ApiResponse({
    status: 200,
    description:
      'Actualizaciones de historias médicas desactivadas exitosamente',
    type: [UpHistory],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o actualizaciones no existen',
  })
  deleteMany(
    @Body() deleteUpHistoryDto: DeleteUpHistoryDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<UpHistory[]>> {
    return this.upHistoryService.deleteMany(deleteUpHistoryDto, user);
  }

  /**
   * Reactiva múltiples actualizaciones de historias médicas
   */
  @Patch('reactivate/all')
  @ApiOperation({
    summary: 'Reactivar múltiples actualizaciones de historias médicas',
  })
  @ApiOkResponse({
    description:
      'Actualizaciones de historias médicas reactivadas exitosamente',
    type: [UpHistory],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o actualizaciones no existen',
  })
  reactivateAll(
    @Body() deleteUpHistoryDto: DeleteUpHistoryDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<UpHistory[]>> {
    return this.upHistoryService.reactivateMany(deleteUpHistoryDto.ids, user);
  }
}
