import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConsultationService } from '../services/consultation.service';
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
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { Consultation } from '../entities/consultation.entity';

/**
 * Controlador REST para gestionar consultas médicas.
 * Expone endpoints para operaciones CRUD sobre consultas.
 */
@ApiTags('Consultation')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'consulta', version: '1' })
@Auth()
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  /**
   * Crea una nueva consulta
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva consulta' })
  @ApiResponse({
    status: 201,
    description: 'Consulta creada exitosamente',
    type: Consultation,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o consulta ya existe',
  })
  create(
    @Body() createConsultationDto: CreateConsultationDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Consultation>> {
    return this.consultationService.create(createConsultationDto, user);
  }

  /**
   * Obtiene una consulta por su ID
   */
  @ApiOperation({ summary: 'Obtener consulta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la consulta' })
  @ApiOkResponse({
    description: 'Consulta encontrada',
    type: Consultation,
  })
  @ApiNotFoundResponse({
    description: 'Consulta no encontrada',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Consultation> {
    return this.consultationService.findOne(id);
  }

  /**
   * Obtiene todas las consultas
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las consultas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las consultas',
    type: [Consultation],
  })
  findAll(): Promise<Consultation[]> {
    return this.consultationService.findAll();
  }
}
