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
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import {
  CreateOutgoingDto,
  UpdateOutgoingDto,
  DeleteOutgoingDto,
} from '../dto';
import {
  DetailedOutgoing,
  Outgoing,
  OutgoingCreateResponseData,
} from '../entities/outgoing.entity';
import { CreateOutgoingDtoStorage } from '../dto/create-outgoingStorage.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

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
  @ApiOkResponse({
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
  ): Promise<BaseApiResponse<Outgoing>> {
    return this.outgoingService.create(createOutgoingDto, user);
  }

  /**
   * Obtiene todas las salidas
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las salidas' })
  @ApiOkResponse({
    status: 200,
    description: 'Lista de todas las salidas',
    type: [Outgoing],
  })
  findAll(): Promise<Outgoing[]> {
    return this.outgoingService.findAll();
  }

  /**
   * Obtiene todos los ingresos con detalles de sus relaciones
   * @returns Una promesa que resuelve con una lista de todos los ingresos con detalles de sus relaciones
   * @throws {Error} Si ocurre un error al obtener los ingresos
   * @returns Una promesa que resuelve con una lista de todos los ingresos con detalles de sus relaciones
   */
  @Get('/detailed')
  @ApiOperation({ summary: 'Obtener todos los ingresos' })
  @ApiOkResponse({
    status: 200,
    description: 'Lista de todos los ingresos',
    type: [DetailedOutgoing],
  })
  findAllWithRelations(): Promise<DetailedOutgoing[]> {
    return this.outgoingService.findAllWithRelations();
  }

  /**
   * Obtiene un ingreso con detalles de sus relaciones
   * @param id - ID del ingreso a buscar
   * @returns Una promesa que resuelve con el ingreso encontrado con detalles de sus relaciones
   * @throws {Error} Si ocurre un error al obtener el ingreso
   */
  @Get('/detailed/:id')
  @ApiOperation({ summary: 'Obtener ingreso por ID' })
  @ApiParam({ name: 'id', description: 'ID del ingreso' })
  @ApiOkResponse({
    description: 'Ingreso encontrado',
    type: [DetailedOutgoing],
  })
  @ApiNotFoundResponse({
    description: 'Ingreso no encontrado',
  })
  findOneWithRelations(@Param('id') id: string): Promise<DetailedOutgoing[]> {
    return this.outgoingService.findByIdWithRelations(id);
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
   * Actualiza una salida existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar salida existente' })
  @ApiOkResponse({
    status: 200,
    description: 'Salida actualizada exitosamente',
    type: Outgoing,
  })
  update(
    @Param('id') id: string,
    @Body() updateOutgoingDto: UpdateOutgoingDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Outgoing>> {
    return this.outgoingService.update(id, updateOutgoingDto, user);
  }

  /**
   * Desactiva múltiples salidas
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples salidas' })
  @ApiOkResponse({
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
  ): Promise<BaseApiResponse<Outgoing[]>> {
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
  ): Promise<BaseApiResponse<Outgoing[]>> {
    return this.outgoingService.reactivateMany(deleteOutgoingDto.ids, user);
  }

  /**
   * crear ingreso a almacen directo
   */
  @Post('create/outgoingStorage')
  @ApiOperation({ summary: 'Crear nueva salida directa de alamacen' })
  @ApiOkResponse({
    status: 201,
    description: 'Salida de almacen creada exitosamente',
    type: OutgoingCreateResponseData,
  })
  @ApiBadRequestResponse({
    description: 'Datos de salida inválidos o salida ya existe',
  })
  createOutgoing(
    @Body() createOutgoingDtoStorage: CreateOutgoingDtoStorage,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<OutgoingCreateResponseData>> {
    return this.outgoingService.createOutgoing(createOutgoingDtoStorage, user);
  }
}
