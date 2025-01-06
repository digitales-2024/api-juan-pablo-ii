import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TypeMovementService } from '../services/type-movement.service';
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
  CreateTypeMovementDto,
  UpdateTypeMovementDto,
  DeleteTypeMovementDto,
} from '../dto';
import { TypeMovement } from '../entities/type-movement.entity';

/**
 * Controlador REST para gestionar tipos de movimiento.
 * Expone endpoints para operaciones CRUD sobre tipos de movimiento.
 */
@ApiTags('Type Movement')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'movement-type', version: '1' })
@Auth()
export class TypeMovementController {
  constructor(private readonly typeMovementService: TypeMovementService) {}

  /**
   * Crea un nuevo tipo de movimiento
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo de movimiento' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de movimiento creado exitosamente',
    type: TypeMovement,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o tipo de movimiento ya existe',
  })
  create(
    @Body() createTypeMovementDto: CreateTypeMovementDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeMovement>> {
    return this.typeMovementService.create(createTypeMovementDto, user);
  }

  /**
   * Obtiene un tipo de movimiento por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de movimiento' })
  @ApiOkResponse({
    description: 'Tipo de movimiento encontrado',
    type: TypeMovement,
  })
  @ApiNotFoundResponse({
    description: 'Tipo de movimiento no encontrado',
  })
  findOne(@Param('id') id: string): Promise<TypeMovement> {
    return this.typeMovementService.findOne(id);
  }

  /**
   * Obtiene todos los tipos de movimiento
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los tipos de movimiento',
    type: [TypeMovement],
  })
  findAll(): Promise<TypeMovement[]> {
    return this.typeMovementService.findAll();
  }

  /**
   * Actualiza un tipo de movimiento existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo de movimiento existente' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de movimiento actualizado exitosamente',
    type: TypeMovement,
  })
  update(
    @Param('id') id: string,
    @Body() updateTypeMovementDto: UpdateTypeMovementDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeMovement>> {
    return this.typeMovementService.update(id, updateTypeMovementDto, user);
  }

  /**
   * Desactiva múltiples tipos de movimiento
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples tipos de movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Tipos de movimiento desactivados exitosamente',
    type: [TypeMovement],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de movimiento no existen',
  })
  deleteMany(
    @Body() deleteTypeMovementDto: DeleteTypeMovementDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeMovement[]>> {
    return this.typeMovementService.deleteMany(deleteTypeMovementDto, user);
  }

  /**
   * Reactiva múltiples tipos de movimiento
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples tipos de movimiento' })
  @ApiOkResponse({
    description: 'Tipos de movimiento reactivados exitosamente',
    type: [TypeMovement],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de movimiento no existen',
  })
  reactivateAll(
    @Body() deleteTypeMovementDto: DeleteTypeMovementDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<TypeMovement[]>> {
    return this.typeMovementService.reactivateMany(
      deleteTypeMovementDto.ids,
      user,
    );
  }
}
