import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OutgoingService } from '../services/outgoing.service';
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
  CreateOutgoingDto,
  UpdateOutgoingDto,
  DeleteOutgoingDto,
} from '../dto';
import { Outgoing } from '../entities/outgoing.entity';

/**
 * Controlador REST para gestionar salidas.
 * Expone endpoints para operaciones CRUD sobre salidas.
 */
@ApiTags('Outgoing')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'outgoing', version: '1' })
@Auth()
export class OutgoingController {
  constructor(private readonly outgoingService: OutgoingService) {}

  /**
   * Crea una nueva salida
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva salida' })
  @ApiResponse({
    status: 201,
    description: 'Salida creada exitosamente',
    type: Outgoing,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o salida ya existe',
  })
  create(
    @Body() createOutgoingDto: CreateOutgoingDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Outgoing>> {
    return this.outgoingService.create(createOutgoingDto, user);
  }

  /**
   * Obtiene una salida por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener salida por ID' })
  @ApiParam({ name: 'id', description: 'ID de la salida' })
  @ApiOkResponse({
    description: 'Salida encontrada',
    type: Outgoing,
  })
  @ApiNotFoundResponse({
    description: 'Salida no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Outgoing> {
    return this.outgoingService.findOne(id);
  }

  /**
   * Obtiene todas las salidas
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las salidas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las salidas',
    type: [Outgoing],
  })
  findAll(): Promise<Outgoing[]> {
    return this.outgoingService.findAll();
  }

  /**
   * Actualiza una salida existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar salida existente' })
  @ApiResponse({
    status: 200,
    description: 'Salida actualizada exitosamente',
    type: Outgoing,
  })
  update(
    @Param('id') id: string,
    @Body() updateOutgoingDto: UpdateOutgoingDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Outgoing>> {
    return this.outgoingService.update(id, updateOutgoingDto, user);
  }

  /**
   * Desactiva múltiples salidas
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples salidas' })
  @ApiResponse({
    status: 200,
    description: 'Salidas desactivadas exitosamente',
    type: [Outgoing],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o salidas no existen',
  })
  deleteMany(
    @Body() deleteOutgoingDto: DeleteOutgoingDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Outgoing[]>> {
    return this.outgoingService.deleteMany(deleteOutgoingDto, user);
  }

  /**
   * Reactiva múltiples salidas
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples salidas' })
  @ApiOkResponse({
    description: 'Salidas reactivadas exitosamente',
    type: [Outgoing],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o salidas no existen',
  })
  reactivateAll(
    @Body() deleteOutgoingDto: DeleteOutgoingDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Outgoing[]>> {
    return this.outgoingService.reactivateMany(deleteOutgoingDto.ids, user);
  }
}