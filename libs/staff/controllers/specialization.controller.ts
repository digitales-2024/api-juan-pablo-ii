import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { SpecializationService } from '../services/specialization.service';
import { CreateSpecializationDto, UpdateSpecializationDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
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

  @Post()
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
  @ApiOkResponse({
    description: 'Lista de todas las especialidades',
    type: [Specialization],
  })
  findAll(): Promise<Specialization[]> {
    return this.specializationService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Especialidad encontrada',
    type: Specialization,
  })
  findOne(@Param('id') id: string): Promise<Specialization> {
    return this.specializationService.findOne(id);
  }

  @Patch(':id')
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
}