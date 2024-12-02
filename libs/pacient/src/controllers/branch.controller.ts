// branch.controller.ts
import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { BranchService } from '../services/branch.service';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { Branch } from '../entities/branch.entity';

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
  create(@Body() createBranchDto: CreateBranchDto, @GetUser() user: UserData) {
    return this.branchService.create(createBranchDto, user);
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
  ) {
    return this.branchService.update(id, updateBranchDto, user);
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
  findAll() {
    return this.branchService.findAll();
  }
}
