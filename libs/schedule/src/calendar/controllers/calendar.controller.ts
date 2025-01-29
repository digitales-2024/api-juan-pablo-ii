import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CalendarService } from '../services/calendar.service';
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
import { UserData } from '@login/login/interfaces';
import {
  CreateCalendarDto,
  UpdateCalendarDto,
  DeleteCalendarDto,
} from '../dto';
import { Calendar } from '../entities/calendar.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Controlador REST para gestionar calendarios.
 * Expone endpoints para operaciones CRUD sobre calendarios.
 */
@ApiTags('Calendar')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'calendario', version: '1' })
@Auth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /**
   * Crea un nuevo calendario
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo calendario' })
  @ApiOkResponse({
    status: 201,
    description: 'Calendario creado exitosamente',
    type: BaseApiResponse<CreateCalendarDto>,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o calendario ya existe',
  })
  create(
    @Body() createCalendarDto: CreateCalendarDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Calendar>> {
    return this.calendarService.create(createCalendarDto, user);
  }

  /**
   * Obtiene un calendario por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener calendario por ID' })
  @ApiParam({ name: 'id', description: 'ID del calendario' })
  @ApiOkResponse({
    description: 'Calendario encontrado',
    type: Calendar,
  })
  @ApiNotFoundResponse({
    description: 'Calendario no encontrado',
  })
  findOne(@Param('id') id: string): Promise<Calendar> {
    return this.calendarService.findOne(id);
  }

  /**
   * Obtiene todos los calendarios
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los calendarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los calendarios',
    type: [Calendar],
  })
  findAll(): Promise<Calendar[]> {
    return this.calendarService.findAll();
  }

  /**
   * Actualiza un calendario existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar calendario existente' })
  @ApiResponse({
    status: 200,
    description: 'Calendario actualizado exitosamente',
    type: BaseApiResponse<UpdateCalendarDto>,
  })
  update(
    @Param('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Calendar>> {
    return this.calendarService.update(id, updateCalendarDto, user);
  }

  /**
   * Desactiva múltiples calendarios
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples calendarios' })
  @ApiResponse({
    status: 200,
    description: 'Calendarios desactivados exitosamente',
    type: [BaseApiResponse<Calendar>],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o calendarios no existen',
  })
  deleteMany(
    @Body() deleteCalendarDto: DeleteCalendarDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Calendar[]>> {
    return this.calendarService.deleteMany(deleteCalendarDto, user);
  }

  /**
   * Reactiva múltiples calendarios
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples calendarios' })
  @ApiOkResponse({
    description: 'Calendarios reactivados exitosamente',
    type: [BaseApiResponse<Calendar>],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o calendarios no existen',
  })
  reactivateAll(
    @Body() deleteCalendarDto: DeleteCalendarDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Calendar[]>> {
    return this.calendarService.reactivateMany(deleteCalendarDto.ids, user);
  }
}
