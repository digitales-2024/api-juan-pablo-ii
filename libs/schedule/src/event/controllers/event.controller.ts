import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventService } from '../services/event.service';
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
import { CreateEventDto, UpdateEventDto, DeleteEventDto } from '../dto';
import { Event } from '../entities/event.entity';

/**
 * Controlador REST para gestionar eventos.
 * Expone endpoints para operaciones CRUD sobre eventos.
 */
@ApiTags('Evento')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'evento', version: '1' })
@Auth()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * Crea un nuevo evento
   */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo evento' })
  @ApiResponse({
    status: 201,
    description: 'Evento creado exitosamente',
    type: Event,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o evento ya existe',
  })
  create(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Event>> {
    return this.eventService.create(createEventDto, user);
  }

  /**
   * Obtiene un evento por su ID
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
  findOne(@Param('id') id: string): Promise<Event> {
    return this.eventService.findOne(id);
  }

  /**
   * Obtiene todos los eventos
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los eventos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los eventos',
    type: [Event],
  })
  findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }

  /**
   * Actualiza un evento existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar evento existente' })
  @ApiResponse({
    status: 200,
    description: 'Evento actualizado exitosamente',
    type: Event,
  })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Event>> {
    return this.eventService.update(id, updateEventDto, user);
  }

  /**
   * Desactiva múltiples eventos
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples eventos' })
  @ApiResponse({
    status: 200,
    description: 'Eventos desactivados exitosamente',
    type: [Event],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o eventos no existen',
  })
  deleteMany(
    @Body() deleteEventDto: DeleteEventDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Event[]>> {
    return this.eventService.deleteMany(deleteEventDto, user);
  }

  /**
   * Reactiva múltiples eventos
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
  reactivateAll(
    @Body() deleteEventDto: DeleteEventDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Event[]>> {
    return this.eventService.reactivateMany(deleteEventDto.ids, user);
  }
}
