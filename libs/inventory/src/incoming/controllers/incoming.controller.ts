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
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { HttpResponse, UserData } from '@login/login/interfaces';
import {
  CreateIncomingDto,
  UpdateIncomingDto,
  DeleteIncomingDto,
} from '../dto';
import { Incoming } from '../entities/incoming.entity';

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
  @ApiResponse({
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
  ): Promise<HttpResponse<Incoming>> {
    return this.incomingService.create(createIncomingDto, user);
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
   * Obtiene todos los ingresos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los ingresos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los ingresos',
    type: [Incoming],
  })
  findAll(): Promise<Incoming[]> {
    return this.incomingService.findAll();
  }

  /**
   * Actualiza un ingreso existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ingreso existente' })
  @ApiResponse({
    status: 200,
    description: 'Ingreso actualizado exitosamente',
    type: Incoming,
  })
  update(
    @Param('id') id: string,
    @Body() updateIncomingDto: UpdateIncomingDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Incoming>> {
    return this.incomingService.update(id, updateIncomingDto, user);
  }

  /**
   * Desactiva múltiples ingresos
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples ingresos' })
  @ApiResponse({
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
  ): Promise<HttpResponse<Incoming[]>> {
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
  ): Promise<HttpResponse<Incoming[]>> {
    return this.incomingService.reactivateMany(deleteIncomingDto.ids, user);
  }
}
