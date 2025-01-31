import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UpdateHistoryService } from '../services/up-history.service';
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
import { UserData } from '@login/login/interfaces';
import {
  CreateUpdateHistoryDto,
  UpdateUpdateHistoryDto,
  DeleteUpdateHistoryDto,
} from '../dto';
import { UpdateHistory } from '../entities/up-history.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

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
@Controller({ path: 'update-history', version: '1' })
@Auth()
export class UpdateHistoryController {
  constructor(private readonly updateHistoryService: UpdateHistoryService) {}

  /**
   * Crea una nueva actualización de historia médica
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva actualización de historia médica' })
  @ApiResponse({
    status: 201,
    description: 'Actualización de historia médica creada exitosamente',
    type: BaseApiResponse<UpdateHistory>,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o actualización ya existe',
  })
  create(
    @Body() createUpdateHistoryDto: CreateUpdateHistoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory>> {
    return this.updateHistoryService.create(createUpdateHistoryDto, user);
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
    type: [UpdateHistory],
  })
  findAll(): Promise<UpdateHistory[]> {
    return this.updateHistoryService.findAll();
  }

  /**
   * Obtiene una actualización de historia médica por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener actualización de historia médica por ID' })
  @ApiParam({ name: 'id', description: 'ID de la actualización' })
  @ApiOkResponse({
    description: 'Actualización de historia médica encontrada',
    type: UpdateHistory,
  })
  @ApiNotFoundResponse({
    description: 'Actualización de historia médica no encontrada',
  })
  findOne(@Param('id') id: string): Promise<UpdateHistory> {
    return this.updateHistoryService.findOne(id);
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
    type: BaseApiResponse<UpdateHistory>,
  })
  update(
    @Param('id') id: string,
    @Body() updateUpdateHistoryDto: UpdateUpdateHistoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory>> {
    return this.updateHistoryService.update(id, updateUpdateHistoryDto, user);
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
    type: BaseApiResponse<UpdateHistory[]>,
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o actualizaciones no existen',
  })
  deleteMany(
    @Body() deleteUpdateHistoryDto: DeleteUpdateHistoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory[]>> {
    return this.updateHistoryService.deleteMany(deleteUpdateHistoryDto, user);
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
    type: BaseApiResponse<UpdateHistory[]>,
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o actualizaciones no existen',
  })
  reactivateAll(
    @Body() deleteUpdateHistoryDto: DeleteUpdateHistoryDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory[]>> {
    return this.updateHistoryService.reactivateMany(
      deleteUpdateHistoryDto.ids,
      user,
    );
  }
}
