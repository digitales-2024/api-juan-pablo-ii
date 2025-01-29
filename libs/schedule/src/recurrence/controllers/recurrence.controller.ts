import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RecurrenceService } from '../services/recurrence.service';
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
  CreateRecurrenceDto,
  UpdateRecurrenceDto,
  DeleteRecurrenceDto,
} from '../dto';
import { Recurrence } from '../entities/recurrence.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Controlador REST para gestionar recurrencias.
 * Expone endpoints para operaciones CRUD sobre recurrencias.
 */
@ApiTags('Recurrence')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'recurrencia', version: '1' })
@Auth()
export class RecurrenceController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  /**
   * Crea una nueva recurrencia
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva recurrencia' })
  @ApiResponse({
    status: 201,
    description: 'Recurrencia creada exitosamente',
    type: BaseApiResponse<CreateRecurrenceDto>,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o recurrencia ya existe',
  })
  create(
    @Body() createRecurrenceDto: CreateRecurrenceDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Recurrence>> {
    return this.recurrenceService.create(createRecurrenceDto, user);
  }

  /**
   * Obtiene una recurrencia por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener recurrencia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la recurrencia' })
  @ApiOkResponse({
    description: 'Recurrencia encontrada',
    type: Recurrence,
  })
  @ApiNotFoundResponse({
    description: 'Recurrencia no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Recurrence> {
    return this.recurrenceService.findOne(id);
  }

  /**
   * Obtiene todas las recurrencias
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las recurrencias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las recurrencias',
    type: [Recurrence],
  })
  findAll(): Promise<Recurrence[]> {
    return this.recurrenceService.findAll();
  }

  /**
   * Actualiza una recurrencia existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar recurrencia existente' })
  @ApiResponse({
    status: 200,
    description: 'Recurrencia actualizada exitosamente',
    type: BaseApiResponse<Recurrence>,
  })
  update(
    @Param('id') id: string,
    @Body() updateRecurrenceDto: UpdateRecurrenceDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Recurrence>> {
    return this.recurrenceService.update(id, updateRecurrenceDto, user);
  }

  /**
   * Desactiva múltiples recurrencias
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples recurrencias' })
  @ApiResponse({
    status: 200,
    description: 'Recurrencias desactivadas exitosamente',
    type: [BaseApiResponse<Recurrence>],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o recurrencias no existen',
  })
  deleteMany(
    @Body() deleteRecurrenceDto: DeleteRecurrenceDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Recurrence[]>> {
    return this.recurrenceService.deleteMany(deleteRecurrenceDto, user);
  }

  /**
   * Reactiva múltiples recurrencias
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples recurrencias' })
  @ApiOkResponse({
    description: 'Recurrencias reactivadas exitosamente',
    type: [BaseApiResponse<Recurrence>],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o recurrencias no existen',
  })
  reactivateAll(
    @Body() deleteRecurrenceDto: DeleteRecurrenceDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Recurrence[]>> {
    return this.recurrenceService.reactivateMany(deleteRecurrenceDto.ids, user);
  }
}
