import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EventService } from '../services/event.service';
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
  ApiQuery,
} from '@nestjs/swagger';
import { Event } from '../entities/event.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { DeleteEventsDto } from '../dto/delete-events.dto';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { EventType } from '../entities/event-type.enum';
import { FindEventsQueryDto } from '../dto/find-events-query.dto';
import { EventStatus } from '@prisma/client';

/**
 * Controlador REST para gestionar eventos del calendario.
 * Expone endpoints para operaciones CRUD sobre eventos.
 */
@ApiTags('Events')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'events', version: '1' })
@Auth()
@UseInterceptors(ClassSerializerInterceptor)
export class EventController {
  constructor(private readonly eventService: EventService) { }

  /**
   * Obtiene eventos filtrados por staffId, tipo, sucursal y estado.
   */
  @Get('filter')
  @ApiOperation({ summary: 'Obtener eventos filtrados' })
  @ApiQuery({
    name: 'staffId',
    required: false,
    description: 'ID del personal para filtrar eventos',
    example: 'uuid-del-personal',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: EventType,
    description: 'Tipo del evento (TURNO, CITA, OTRO)',
    example: EventType.TURNO,
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'ID de la sucursal para filtrar eventos',
    example: 'uuid-de-la-sucursal',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EventStatus,
    description: 'Estado del evento (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)',
    example: EventStatus.CONFIRMED,
  })
  @ApiOkResponse({
    description: 'Lista de eventos filtrados',
    type: [Event],
  })
  async findEventsByFilter(
    @Query() query: FindEventsQueryDto,
  ): Promise<Event[]> {
    return this.eventService.findEventsByFilter(query);
  }

  /**
   * Crea un nuevo evento.
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo evento' })
  @ApiCreatedResponse({
    description: 'Evento creado exitosamente',
    type: Event,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o evento ya existe',
  })
  create(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Event>> {
    return this.eventService.create(createEventDto, user);
  }

  /**
   * Obtiene un evento por su ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener evento por ID' })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiOkResponse({
    description: 'Evento encontrado',
    type: Event,
  })
  @ApiNotFoundResponse({
    description: 'Evento no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventService.findOne(id);
  }

  /**
   * Obtiene todos los eventos.
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los eventos' })
  @ApiOkResponse({
    description: 'Lista de todos los eventos',
    type: [Event],
  })
  async findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }

  /**
   * Actualiza un evento existente.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar evento existente' })
  @ApiParam({ name: 'id', description: 'ID del evento a actualizar' })
  @ApiOkResponse({
    description: 'Evento actualizado exitosamente',
    type: Event,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o evento no existe',
  })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Event>> {
    return this.eventService.update(id, updateEventDto, user);
  }

  /**
   * Desactiva múltiples eventos.
   */
  @ApiOperation({ summary: 'Desactivar múltiples eventos' })
  @ApiOkResponse({
    description: 'Eventos desactivados exitosamente',
    type: [Event],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o eventos no existen',
  })
  @Delete('remove/all')
  deleteMany(
    @Body() deleteEventsDto: DeleteEventsDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    return this.eventService.deleteMany(deleteEventsDto, user);
  }

  /**
   * Reactiva múltiples eventos.
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples eventos' })
  @ApiOkResponse({
    description: 'Eventos reactivados exitosamente',
    type: [Event],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o eventos no existen',
  })
  @Patch('reactivate/all')
  reactivateAll(
    @Body() deleteEventsDto: DeleteEventsDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    return this.eventService.reactivateMany(deleteEventsDto.ids, user);
  }

  @Post(':id/generate-events')
  async generateEvents(
    @Param('id') staffScheduleId: string,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Event[]>> {
    return this.eventService.createRecurrentEvents(staffScheduleId, user);
  }
}
