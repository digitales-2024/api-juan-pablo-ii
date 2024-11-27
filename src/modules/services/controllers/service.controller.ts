import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { ServiceService } from '../services/service.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { UserData } from '@login/login/interfaces';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Controlador REST para gestionar servicios médicos
 * Expone endpoints para operaciones CRUD
 *
 * @class
 */

@ApiTags('Services')
@ApiBadRequestResponse({ description: 'Bad Request' })
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller({ path: 'services', version: '1' })
@Auth()
export class ServiceController {
  /**
   * Constructor del controlador
   * @param {ServiceService} serviceService - Servicio de lógica de negocio
   */
  constructor(private readonly serviceService: ServiceService) {}

  /**
   * Crear nuevo servicio
   * @route POST /services
   * @param {CreateServiceDto} createServiceDto - Datos del servicio a crear
   */
  @ApiCreatedResponse({ description: 'Service created successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or bad request' })
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @GetUser() user: UserData,
  ) {
    return this.serviceService.create(createServiceDto, user);
  }

  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findById(id);
  }
}
