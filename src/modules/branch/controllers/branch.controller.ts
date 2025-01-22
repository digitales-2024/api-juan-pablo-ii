// branch.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BranchService } from '../services/branch.service';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import { Branch } from '../entities/branch.entity';
import { CreateBranchDto, UpdateBranchDto, DeleteBranchesDto } from '../dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Controlador REST para gestionar sucursales.
 * Expone endpoints para operaciones CRUD sobre sucursales.
 */
@ApiTags('Branch')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'branch', version: '1' })
@Auth()
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /**
   * Crea una nueva sucursal
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva sucursal' })
  @ApiResponse({
    status: 201,
    description: 'Sucursal creada exitosamente',
    type: Branch,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o sucursal ya existe',
  })
  create(
    @Body() createBranchDto: CreateBranchDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Branch>> {
    return this.branchService.create(createBranchDto, user);
  }

  /**
   * Obtiene un servicio por su ID
   */
  @ApiOperation({ summary: 'Obtener sucursal por ID' })
  @ApiParam({ name: 'id', description: 'ID de la sucursal' })
  @ApiOkResponse({
    description: 'Sucursal encontrada',
    type: Branch,
  })
  @ApiNotFoundResponse({
    description: 'Sucursal no encontrada',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Branch> {
    return this.branchService.findOne(id);
  }

  /**
   * Obtiene todas las sucursales
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las sucursales' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las sucursales',
    type: [Branch],
  })
  findAll(): Promise<Branch[]> {
    return this.branchService.findAll();
  }

  /**
   * Actualiza una sucursal existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar sucursal existente' })
  @ApiResponse({
    status: 200,
    description: 'Sucursal actualizada exitosamente',
    type: Branch,
  })
  update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Branch>> {
    return this.branchService.update(id, updateBranchDto, user);
  }

  /**
   * Desactiva múltiples sucursales
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples sucursales' })
  @ApiResponse({
    status: 200,
    description: 'Sucursales desactivadas exitosamente',
    type: [Branch],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o sucursales no existen',
  })
  deleteMany(
    @Body() deleteBranchesDto: DeleteBranchesDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Branch[]>> {
    return this.branchService.deleteMany(deleteBranchesDto, user);
  }

  /**
   * Reactiva múltiples sucursales
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples sucursales' })
  @ApiOkResponse({
    description: 'Sucursales reactivadas exitosamente',
    type: [Branch],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o sucursales no existen',
  })
  reactivateAll(
    @Body() deleteBranchesDto: DeleteBranchesDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Branch[]>> {
    return this.branchService.reactivateMany(deleteBranchesDto.ids, user);
  }
}
