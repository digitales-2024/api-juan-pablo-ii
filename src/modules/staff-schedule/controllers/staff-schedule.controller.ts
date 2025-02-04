import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffScheduleService } from '../services/staff-schedule.service';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import { StaffSchedule } from '../entities/staff-schedule.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateStaffScheduleDto } from '../dto/create-staff-schedule.dto';
import { UpdateStaffScheduleDto } from '../dto/update-staff-schedule.dto';
import { DeleteStaffSchedulesDto } from '../dto/delete-staff-schedule.dto';

/**
 * Controlador REST para gestionar horarios del personal.
 * Expone endpoints para operaciones CRUD sobre horarios.
 */
@ApiTags('StaffSchedule')
@ApiBadRequestResponse({
  description: 'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'staff-schedule', version: '1' })
@Auth()
export class StaffScheduleController {
  constructor(private readonly staffScheduleService: StaffScheduleService) {}

  /**
   * Crea un nuevo horario
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo horario' })
  @ApiResponse({
    status: 201,
    description: 'Horario creado exitosamente',
    type: StaffSchedule,
  })
  create(
    @Body() createStaffScheduleDto: CreateStaffScheduleDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule>> {
    return this.staffScheduleService.create(createStaffScheduleDto, user);
  }

  /**
   * Obtiene un horario por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener horario por ID' })
  @ApiParam({ name: 'id', description: 'ID del horario' })
  @ApiOkResponse({
    description: 'Horario encontrado',
    type: StaffSchedule,
  })
  findOne(@Param('id') id: string): Promise<StaffSchedule> {
    return this.staffScheduleService.findOne(id);
  }

  /**
   * Obtiene todos los horarios
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los horarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los horarios',
    type: [StaffSchedule],
  })
  findAll(): Promise<StaffSchedule[]> {
    return this.staffScheduleService.findAll();
  }

  /**
   * Actualiza un horario existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar horario existente' })
  @ApiResponse({
    status: 200,
    description: 'Horario actualizado exitosamente',
    type: StaffSchedule,
  })
  update(
    @Param('id') id: string,
    @Body() updateStaffScheduleDto: UpdateStaffScheduleDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule>> {
    return this.staffScheduleService.update(id, updateStaffScheduleDto, user);
  }

  /**
   * Desactiva múltiples horarios
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples horarios' })
  @ApiResponse({
    status: 200,
    description: 'Horarios desactivados exitosamente',
    type: [StaffSchedule],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o horarios no existen',
  })
  deleteMany(
    @Body() deleteStaffSchedulesDto: DeleteStaffSchedulesDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule[]>> {
    return this.staffScheduleService.deleteMany(deleteStaffSchedulesDto, user);
  }

  /**
   * Reactiva múltiples horarios
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples horarios' })
  @ApiOkResponse({
    description: 'Horarios reactivados exitosamente',
    type: [StaffSchedule],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o horarios no existen',
  })
  reactivateAll(
    @Body() deleteStaffSchedulesDto: DeleteStaffSchedulesDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<StaffSchedule[]>> {
    return this.staffScheduleService.reactivateMany(deleteStaffSchedulesDto.ids, user);
  }
}
