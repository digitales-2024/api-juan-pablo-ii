import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HistoryService } from '../services/history.service';
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
import { CreateHistoryDto, UpdateHistoryDto, DeleteHistoryDto } from '../dto';
import { History } from '../entities/history.entity';

/**
 * Controlador REST para gestionar historias médicas.
 * Expone endpoints para operaciones CRUD sobre historias.
 */
@ApiTags('Medical History')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'historia', version: '1' })
@Auth()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /**
   * Crea una nueva historia médica
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva historia médica' })
  @ApiResponse({
    status: 201,
    description: 'Historia médica creada exitosamente',
    type: History,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o historia médica ya existe',
  })
  create(
    @Body() createHistoryDto: CreateHistoryDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<History>> {
    return this.historyService.create(createHistoryDto, user);
  }

  /**
   * Obtiene una historia médica por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener historia médica por ID' })
  @ApiParam({ name: 'id', description: 'ID de la historia médica' })
  @ApiOkResponse({
    description: 'Historia médica encontrada',
    type: History,
  })
  @ApiNotFoundResponse({
    description: 'Historia médica no encontrada',
  })
  findOne(@Param('id') id: string): Promise<History> {
    return this.historyService.findOne(id);
  }

  /**
   * Obtiene todas las historias médicas
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las historias médicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las historias médicas',
    type: [History],
  })
  findAll(): Promise<History[]> {
    return this.historyService.findAll();
  }

  /**
   * Actualiza una historia médica existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar historia médica existente' })
  @ApiResponse({
    status: 200,
    description: 'Historia médica actualizada exitosamente',
    type: History,
  })
  update(
    @Param('id') id: string,
    @Body() updateHistoryDto: UpdateHistoryDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<History>> {
    return this.historyService.update(id, updateHistoryDto, user);
  }

  /**
   * Desactiva múltiples historias médicas
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples historias médicas' })
  @ApiResponse({
    status: 200,
    description: 'Historias médicas desactivadas exitosamente',
    type: [History],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o historias médicas no existen',
  })
  deleteMany(
    @Body() deleteHistoryDto: DeleteHistoryDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<History[]>> {
    return this.historyService.deleteMany(deleteHistoryDto, user);
  }

  /**
   * Reactiva múltiples historias médicas
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples historias médicas' })
  @ApiOkResponse({
    description: 'Historias médicas reactivadas exitosamente',
    type: [History],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o historias médicas no existen',
  })
  reactivateAll(
    @Body() deleteHistoryDto: DeleteHistoryDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<History[]>> {
    return this.historyService.reactivateMany(deleteHistoryDto.ids, user);
  }
}
