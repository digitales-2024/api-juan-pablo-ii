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
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { UserData } from '@login/login/interfaces';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Service } from '../entities/service.entity';
import { CreateServiceDto, UpdateServiceDto, DeleteServicesDto } from '../dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Controlador REST para gestionar servicios médicos.
 * Expone endpoints para operaciones CRUD sobre servicios.
 */
@ApiTags('Services')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'services', version: '1' })
@Auth()
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  /**
   * Crea un nuevo servicio médico
   */
  @ApiOperation({ summary: 'Crear nuevo servicio' })
  @ApiCreatedResponse({
    description: 'Servicio creado exitosamente',
    type: Service,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o servicio ya existe',
  })
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Service>> {
    return this.serviceService.create(createServiceDto, user);
  }

  /**
   * Obtiene un servicio por su ID
   */
  @ApiOperation({ summary: 'Obtener servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiOkResponse({
    description: 'Servicio encontrado',
    type: Service,
  })
  @ApiNotFoundResponse({
    description: 'Servicio no encontrado',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Service> {
    return this.serviceService.findServiceById(id);
  }

  /**
   * Obtiene todos los servicios
   */
  @ApiOperation({ summary: 'Obtener todos los servicios' })
  @ApiOkResponse({
    description: 'Lista de todos los servicios',
    type: [Service],
  })
  @Get()
  findAll(): Promise<Service[]> {
    return this.serviceService.findAll();
  }

  /**
   * Actualiza un servicio existente
   */
  @ApiOperation({ summary: 'Actualizar servicio existente' })
  @ApiParam({ name: 'id', description: 'ID del servicio a actualizar' })
  @ApiOkResponse({
    description: 'Servicio actualizado exitosamente',
    type: Service,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o servicio no existe',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Service>> {
    return this.serviceService.update(id, updateServiceDto, user);
  }

  /**
   * Desactiva múltiples servicios
   */
  @ApiOperation({ summary: 'Desactivar múltiples servicios' })
  @ApiOkResponse({
    description: 'Servicios desactivados exitosamente',
    type: [Service],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o servicios no existen',
  })
  @Delete('remove/all')
  deleteMany(
    @Body() deleteServicesDto: DeleteServicesDto,
    @GetUser() user: UserData,
  ) {
    return this.serviceService.deleteMany(deleteServicesDto, user);
  }

  /**
   * Reactiva múltiples servicios
   */
  @ApiOperation({ summary: 'Reactivar múltiples servicios' })
  @ApiOkResponse({
    description: 'Servicios reactivados exitosamente',
    type: [Service],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o servicios no existen',
  })
  @Patch('reactivate/all')
  reactivateAll(
    @Body() deleteServicesDto: DeleteServicesDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Service[]>> {
    return this.serviceService.reactivateMany(deleteServicesDto.ids, user);
  }
}
