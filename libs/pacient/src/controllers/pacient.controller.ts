// pacient.controller.ts
import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PacientService } from '../services/pacient.service';
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
import { CreatePacienteDto } from '../dto/create-pacient.dto';
import { UpdatePacientDto } from '../dto/update-pacient.dto';
import { Paciente } from '../entities/pacient.entity';

/**
 * Controlador REST para gestionar pacientes.
 * Expone endpoints para operaciones CRUD sobre pacientes.
 */
@ApiTags('Paciente')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'paciente', version: '1' })
@Auth()
export class PacientController {
  constructor(private readonly pacientService: PacientService) {}

  /**
   * Crea un nuevo paciente
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente creado exitosamente',
    type: Paciente,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o paciente ya existe',
  })
  create(
    @Body() createPacienteDto: CreatePacienteDto,
    @GetUser() user: UserData,
  ) {
    return this.pacientService.create(createPacienteDto, user);
  }

  /**
   * Obtiene un paciente por su ID
   */
  @ApiOperation({ summary: 'Obtener paciente por ID' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiOkResponse({
    description: 'Paciente encontrado',
    type: Paciente,
  })
  @ApiNotFoundResponse({
    description: 'Paciente no encontrado',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Paciente> {
    return this.pacientService.findOne(id);
  }

  /**
   * Obtiene todos los pacientes
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los pacientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los pacientes',
    type: [Paciente],
  })
  findAll() {
    return this.pacientService.findAll();
  }

  /**
   * Actualiza un paciente existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar paciente existente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente actualizado exitosamente',
    type: Paciente,
  })
  update(
    @Param('id') id: string,
    @Body() updatePacientDto: UpdatePacientDto,
    @GetUser() user: UserData,
  ) {
    return this.pacientService.update(id, updatePacientDto, user);
  }
}
