import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ServiceService } from '../services/service.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { HttpResponse, UserData } from '@login/login/interfaces';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateServiceDto } from '../dto';
import { Service } from '../entities/service.entity';
import { DeleteServicesDto } from '../dto/delete-services.dto';

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
  ): Promise<HttpResponse<Service>> {
    return this.serviceService.create(createServiceDto, user);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Design project updated successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or bad request' })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Service>> {
    return this.serviceService.update(id, updateServiceDto, user);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Service deleted successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or bad request' })
  delete(
    @Param('id') id: string,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Service>> {
    return this.serviceService.delete(id, user);
  }

  @Delete('remove/all')
  @ApiOkResponse({ description: 'Services deleted successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed or bad request' })
  deleteMany(
    @Body() deleteServicesDto: DeleteServicesDto,
    @GetUser() user: UserData,
  ) {
    return this.serviceService.deleteMany(deleteServicesDto, user);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Service found' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  findOne(@Param('id') id: string): Promise<Service> {
    return this.serviceService.findOne(id);
  }

  @Get()
  @ApiOkResponse({
    description: 'Get all services',
  })
  findAll(): Promise<Service[]> {
    return this.serviceService.findAll();
  }
}
