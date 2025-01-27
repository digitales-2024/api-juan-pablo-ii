import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffTypeService } from '../services/staff-type.service';
import {
  CreateStaffTypeDto,
  DeleteStaffTypeDto,
  UpdateStaffTypeDto,
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
import { UserData } from '@login/login/interfaces';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { StaffType } from '../entities/staff.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
@ApiTags('Staff Type')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'staff-type', version: '1' })
@Auth()
export class StaffTypeController {
  constructor(private readonly staffTypeService: StaffTypeService) {}

  /**
   * Crea un nuevo tipo de personal.
   * @param CreateStaffTypeDto - Datos para crear el tipo de personal.
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de personal' })
  @ApiCreatedResponse({
    description: 'Tipo de personal creado exitosamente',
    type: StaffType,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o tipo de personal ya existe',
  })
  create(
    @Body() CreateStaffTypeDto: CreateStaffTypeDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<StaffType>> {
    return this.staffTypeService.create(CreateStaffTypeDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de personal' })
  @ApiOkResponse({
    description: 'Lista de todos los tipos de personal',
    type: [StaffType],
  })
  findAll(): Promise<StaffType[]> {
    return this.staffTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de personal por ID' })
  @ApiOkResponse({
    description: 'Tipo de personal encontrado',
    type: StaffType,
  })
  findOne(@Param('id') id: string): Promise<StaffType> {
    return this.staffTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de personal' })
  @ApiOkResponse({
    description: 'Tipo de personal actualizado exitosamente',
    type: StaffType,
  })
  update(
    @Param('id') id: string,
    @Body() UpdateStaffTypeDto: UpdateStaffTypeDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<StaffType>> {
    return this.staffTypeService.update(id, UpdateStaffTypeDto, user);
  }
  /**
   * Elimina múltiples tipos de personal
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Eliminar múltiples tipos de personal' })
  @ApiResponse({
    status: 200,
    description: 'Tipos de personal eliminados exitosamente',
    type: [StaffType],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de personal no existen',
  })
  deleteMany(
    @Body() DeleteStaffTypeDto: DeleteStaffTypeDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<StaffType[]>> {
    return this.staffTypeService.deleteMany(DeleteStaffTypeDto, user);
  }

  /**
   * Reactiva múltiples sucursales
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples tipos de personal' })
  @ApiOkResponse({
    description: 'Tipos de personal reactivados exitosamente',
    type: [StaffType],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de personal no existen',
  })
  reactivateAll(
    @Body() DeleteStaffTypeDto: DeleteStaffTypeDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<StaffType[]>> {
    return this.staffTypeService.reactivateMany(
      DeleteStaffTypeDto.ids,
      user,
    );
  }
}
