import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MovementService } from '../services/movement.service';
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
  CreateMovementDto,
  UpdateMovementDto,
  DeleteMovementDto,
} from '../dto';
import { Movement } from '../entities/movement.entity';

/**
 * Controlador REST para gestionar movimientos.
 * Expone endpoints para operaciones CRUD sobre movimientos.
 */
@ApiTags('Movements')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'movements', version: '1' })
@Auth()
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  /**
   * Crea un nuevo movimiento
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo movimiento' })
  @ApiResponse({
    status: 201,
    description: 'Movimiento creado exitosamente',
    type: Movement,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o movimiento ya existe',
  })
  create(
    @Body() createMovementDto: CreateMovementDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Movement>> {
    return this.movementService.create(createMovementDto, user);
  }

  /**
   * Obtiene un movimiento por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiOkResponse({
    description: 'Movimiento encontrado',
    type: Movement,
  })
  @ApiNotFoundResponse({
    description: 'Movimiento no encontrado',
  })
  findOne(@Param('id') id: string): Promise<Movement> {
    return this.movementService.findOne(id);
  }

  /**
   * Obtiene todos los movimientos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los movimientos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los movimientos',
    type: [Movement],
  })
  findAll(): Promise<Movement[]> {
    return this.movementService.findAll();
  }

  /**
   * Actualiza un movimiento existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar movimiento existente' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento actualizado exitosamente',
    type: Movement,
  })
  update(
    @Param('id') id: string,
    @Body() updateMovementDto: UpdateMovementDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Movement>> {
    return this.movementService.update(id, updateMovementDto, user);
  }

  /**
   * Desactiva múltiples movimientos
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples movimientos' })
  @ApiResponse({
    status: 200,
    description: 'Movimientos desactivados exitosamente',
    type: [Movement],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o movimientos no existen',
  })
  deleteMany(
    @Body() deleteMovementDto: DeleteMovementDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Movement[]>> {
    return this.movementService.deleteMany(deleteMovementDto, user);
  }

  /**
   * Reactiva múltiples movimientos
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples movimientos' })
  @ApiOkResponse({
    description: 'Movimientos reactivados exitosamente',
    type: [Movement],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o movimientos no existen',
  })
  reactivateAll(
    @Body() deleteMovementDto: DeleteMovementDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Movement[]>> {
    return this.movementService.reactivateMany(deleteMovementDto.ids, user);
  }
}
