import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import { StaffSchedule } from '../entities/staff-schedule.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateStaffScheduleDto } from '../dto/create-staff-schedule.dto';
import { UpdateStaffScheduleDto } from '../dto/update-staff-schedule.dto';
import { DeleteStaffSchedulesDto } from '../dto/delete-staff-schedule.dto';
import { FindStaffSchedulesQueryDto } from '../dto/find-staff-schedule-query.dto';
import { Logger } from '@nestjs/common';

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
  private readonly logger = new Logger(StaffScheduleController.name);

  constructor(private readonly staffScheduleService: StaffScheduleService) { }

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
   * Obtiene horarios filtrados por branch y/o staff
   */
  @Get('filter')
  @ApiOperation({ summary: 'Filtrar horarios por criterios (sucursal, personal y días)' })
  @ApiQuery({ name: 'branchId', required: false, example: 'uuid-ejemplo' })
  @ApiQuery({ name: 'staffId', required: false, example: 'uuid-ejemplo' })
  @ApiQuery({ name: 'daysOfWeek', required: false, example: '[1,3,5]' })
  @ApiOkResponse({
    description: 'Horarios encontrados',
    type: [StaffSchedule],
  })
  async findByCriteria(@Query() query: FindStaffSchedulesQueryDto): Promise<StaffSchedule[]> {
    this.logger.debug(`Solicitud de filtrado - Query: ${JSON.stringify(query)}`);
    return this.staffScheduleService.findManyByStaffAndBranch(query);
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
