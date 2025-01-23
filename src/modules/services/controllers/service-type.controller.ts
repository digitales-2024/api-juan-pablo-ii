import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { ServiceTypeService } from '../services/service-type.service';
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
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { ServiceType } from '../entities/service.entity';
import { UserData } from '@login/login/interfaces';
import {
  CreateServiceTypeDto,
  UpdateServiceTypeDto,
  DeleteServiceTypesDto,
} from '../dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Controlador REST para gestionar tipos de servicios médicos.
 * Expone endpoints para operaciones CRUD sobre tipos de servicios.
 */
@ApiTags('ServiceTypes')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'service-types', version: '1' })
@Auth()
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  /**
   * Crea un nuevo tipo de servicio
   */
  @ApiOperation({ summary: 'Crear nuevo tipo de servicio' })
  @ApiCreatedResponse({
    description: 'Tipo de servicio creado exitosamente',
    type: ServiceType,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o tipo de servicio ya existe',
  })
  @Post()
  create(
    @Body() createServiceTypeDto: CreateServiceTypeDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<ServiceType>> {
    return this.serviceTypeService.create(createServiceTypeDto, user);
  }

  /**
   * Obtiene un tipo de servicio por su ID
   */
  @ApiOperation({ summary: 'Obtener tipo de servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de servicio' })
  @ApiOkResponse({
    description: 'Tipo de servicio encontrado',
    type: ServiceType,
  })
  @ApiNotFoundResponse({
    description: 'Tipo de servicio no encontrado',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ServiceType> {
    return this.serviceTypeService.findOne(id);
  }

  /**
   * Obtiene todos los tipos de servicios
   */
  @ApiOperation({ summary: 'Obtener todos los tipos de servicios' })
  @ApiOkResponse({
    description: 'Lista de todos los tipos de servicios',
    type: [ServiceType],
  })
  @Get()
  findAll(): Promise<ServiceType[]> {
    return this.serviceTypeService.findAll();
  }

  /**
   * Actualiza un tipo de servicio existente
   */
  @ApiOperation({ summary: 'Actualizar tipo de servicio' })
  @ApiParam({ name: 'id', description: 'ID del tipo de servicio a actualizar' })
  @ApiOkResponse({
    description: 'Tipo de servicio actualizado exitosamente',
    type: ServiceType,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o tipo de servicio no existe',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceTypeDto: UpdateServiceTypeDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<ServiceType>> {
    return this.serviceTypeService.update(id, updateServiceTypeDto, user);
  }

  /**
   * Desactiva múltiples tipos de servicio
   */
  @ApiOperation({ summary: 'Desactivar múltiples tipos de servicios' })
  @ApiOkResponse({
    description: 'Tipos de servicios desactivados exitosamente',
    type: [ServiceType],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de servicios no existen',
  })
  @Delete('remove/all')
  deleteMany(
    @Body() deleteServiceTypesDto: DeleteServiceTypesDto,
    @GetUser() user: UserData,
  ) {
    return this.serviceTypeService.deleteMany(deleteServiceTypesDto, user);
  }

  /**
   * Reactiva múltiples tipos de servicio
   */
  @ApiOperation({ summary: 'Reactivar múltiples tipos de servicios' })
  @ApiOkResponse({
    description: 'Tipos de servicios reactivados exitosamente',
    type: [ServiceType],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de servicios no existen',
  })
  @Patch('reactivate/all')
  reactivateAll(
    @Body() deleteServiceTypesDto: DeleteServiceTypesDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<ServiceType[]>> {
    return this.serviceTypeService.reactivateMany(
      deleteServiceTypesDto.ids,
      user,
    );
  }
}
