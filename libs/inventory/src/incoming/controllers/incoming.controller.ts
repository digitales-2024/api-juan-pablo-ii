import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IncomingService } from '../services/incoming.service';
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
  CreateIncomingDto,
  UpdateIncomingDto,
  DeleteIncomingDto,
} from '../dto';
import {
  DetailedIncoming,
  Incoming,
  IncomingCreateResponseData,
} from '../entities/incoming.entity';
import { CreateIncomingDtoStorage } from '../dto/create-incomingStorage.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Controlador REST para gestionar ingresos.
 * Expone endpoints para operaciones CRUD sobre ingresos.
 */
@ApiTags('Incoming')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'incoming', version: '1' })
@Auth()
export class IncomingController {
  constructor(private readonly incomingService: IncomingService) {}

  /**
   * Crea un nuevo ingreso
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo ingreso' })
  @ApiOkResponse({
    status: 201,
    description: 'Ingreso creado exitosamente',
    type: Incoming,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o ingreso ya existe',
  })
  create(
    @Body() createIncomingDto: CreateIncomingDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Incoming>> {
    return this.incomingService.create(createIncomingDto, user);
  }

  /**
   * Obtiene todos los ingresos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los ingresos' })
  @ApiOkResponse({
    status: 200,
    description: 'Lista de todos los ingresos',
    type: [Incoming],
  })
  findAll(): Promise<Incoming[]> {
    return this.incomingService.findAll();
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
    type: [DetailedIncoming],
  })
  findAllWithRelations(): Promise<DetailedIncoming[]> {
    return this.incomingService.findAllWithRelations();
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
    type: [DetailedIncoming],
  })
  @ApiNotFoundResponse({
    description: 'Ingreso no encontrado',
  })
  findOneWithRelations(@Param('id') id: string): Promise<DetailedIncoming[]> {
    return this.incomingService.findByIdWithRelations(id);
  }

  /**
   * Obtiene un ingreso por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener ingreso por ID' })
  @ApiParam({ name: 'id', description: 'ID del ingreso' })
  @ApiOkResponse({
    description: 'Ingreso encontrado',
    type: Incoming,
  })
  @ApiNotFoundResponse({
    description: 'Ingreso no encontrado',
  })
  findOne(@Param('id') id: string): Promise<Incoming> {
    return this.incomingService.findOne(id);
  }

  /**
   * Actualiza un ingreso existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ingreso existente' })
  @ApiOkResponse({
    status: 200,
    description: 'Ingreso actualizado exitosamente',
    type: Incoming,
  })
  update(
    @Param('id') id: string,
    @Body() updateIncomingDto: UpdateIncomingDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Incoming>> {
    return this.incomingService.update(id, updateIncomingDto, user);
  }

  /**
   * Desactiva múltiples ingresos
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples ingresos' })
  @ApiOkResponse({
    status: 200,
    description: 'Ingresos desactivados exitosamente',
    type: [Incoming],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o ingresos no existen',
  })
  deleteMany(
    @Body() deleteIncomingDto: DeleteIncomingDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Incoming[]>> {
    return this.incomingService.deleteMany(deleteIncomingDto, user);
  }

  /**
   * Reactiva múltiples ingresos
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples ingresos' })
  @ApiOkResponse({
    description: 'Ingresos reactivados exitosamente',
    type: [Incoming],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o ingresos no existen',
  })
  reactivateAll(
    @Body() deleteIncomingDto: DeleteIncomingDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Incoming[]>> {
    return this.incomingService.reactivateMany(deleteIncomingDto.ids, user);
  }

  /**
   * crear ingreso a almacen directo
   */
  @Post('create/incomingStorage')
  @ApiOperation({ summary: 'Crear nuevo ingreso directo a alamacen' })
  @ApiOkResponse({
    status: 201,
    description: 'Ingreso a almacen creado exitosamente',
    type: IncomingCreateResponseData,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o ingreso ya existe',
  })
  createIncoming(
    @Body() createIncomingDtoStorage: CreateIncomingDtoStorage,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<IncomingCreateResponseData>> {
    return this.incomingService.createIncoming(createIncomingDtoStorage, user);
  }
}
