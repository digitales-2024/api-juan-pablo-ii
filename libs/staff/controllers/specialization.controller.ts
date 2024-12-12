import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SpecializationService } from '../services/specialization.service';
import {
  CreateSpecializationDto,
  DeleteSpecializationDto,
  UpdateSpecializationDto,
} from '../dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Specialization } from '../entities/staff.entity';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';

@ApiTags('Specialization')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'specialization', version: '1' })
@Auth()
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) {}

  /**
   * Crea una nueva especialidad.
   * @param createSpecializationDto - Datos para crear la especialidad.
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva especialidad' })
  @ApiCreatedResponse({
    description: 'Especialidad creada exitosamente',
    type: Specialization,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o especialidad ya existe',
  })
  create(
    @Body() createSpecializationDto: CreateSpecializationDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Specialization>> {
    return this.specializationService.create(createSpecializationDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las especialidades' })
  @ApiOkResponse({
    description: 'Lista de todas las especialidades',
    type: [Specialization],
  })
  findAll(): Promise<Specialization[]> {
    return this.specializationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener especialidad por ID' })
  @ApiOkResponse({
    description: 'Especialidad encontrada',
    type: Specialization,
  })
  findOne(@Param('id') id: string): Promise<Specialization> {
    return this.specializationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Eliminar múltiples especialidades' })
  @ApiOkResponse({
    description: 'Especialidad actualizada exitosamente',
    type: Specialization,
  })
  update(
    @Param('id') id: string,
    @Body() updateSpecializationDto: UpdateSpecializationDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Specialization>> {
    return this.specializationService.update(id, updateSpecializationDto, user);
  }
  /**
   * Elimina múltiples especialidades
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Eliminar múltiples especialidades' })
  @ApiResponse({
    status: 200,
    description: 'Especialidades eliminadas exitosamente',
    type: [Specialization],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o especialidades no existen',
  })
  deleteMany(
    @Body() deleteSpecializationDto: DeleteSpecializationDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Specialization[]>> {
    return this.specializationService.deleteMany(deleteSpecializationDto, user);
  }

  /**
   * Reactiva múltiples sucursales
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples especialidades' })
  @ApiOkResponse({
    description: 'Especialidades reactivadas exitosamente',
    type: [Specialization],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o especialidades no existen',
  })
  reactivateAll(
    @Body() DeleteSpecializationDto: DeleteSpecializationDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Specialization[]>> {
    return this.specializationService.reactivateMany(
      DeleteSpecializationDto.ids,
      user,
    );
  }
}
