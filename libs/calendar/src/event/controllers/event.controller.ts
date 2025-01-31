import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
} from '@nestjs/swagger';
import { Event } from '../entities/event.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateEventDto } from '../dto/create-event.dto';

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
export class EventController {
  constructor(private readonly eventService: EventService) {}

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
  @ApiOperation({ summary: 'Obtener evento por ID' })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiOkResponse({
    description: 'Evento encontrado',
    type: Event,
  })
  @ApiNotFoundResponse({
    description: 'Evento no encontrado',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Event> {
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
  findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }

//   /**
//    * Actualiza un evento existente.
//    */
//   @Patch(':id')
//   @ApiOperation({ summary: 'Actualizar evento existente' })
//   @ApiParam({ name: 'id', description: 'ID del evento a actualizar' })
//   @ApiOkResponse({
//     description: 'Evento actualizado exitosamente',
//     type: Event,
//   })
//   @ApiBadRequestResponse({
//     description: 'Datos de entrada inválidos o evento no existe',
//   })
//   update(
//     @Param('id') id: string,
//     @Body() updateEventDto: UpdateEventDto,
//     @GetUser() user: UserData,
//   ): Promise<BaseApiResponse<Event>> {
//     return this.eventService.update(id, updateEventDto, user);
//   }

//   /**
//    * Desactiva múltiples eventos.
//    */
//   @ApiOperation({ summary: 'Desactivar múltiples eventos' })
//   @ApiOkResponse({
//     description: 'Eventos desactivados exitosamente',
//     type: [Event],
//   })
//   @ApiBadRequestResponse({
//     description: 'IDs inválidos o eventos no existen',
//   })
//   @Delete('remove/all')
//   deleteMany(
//     @Body() deleteEventsDto: DeleteEventsDto,
//     @GetUser() user: UserData,
//   ): Promise<BaseApiResponse<Event[]>> {
//     return this.eventService.deleteMany(deleteEventsDto, user);
//   }

//   /**
//    * Reactiva múltiples eventos.
//    */
//   @Patch('reactivate/all')
//   @ApiOperation({ summary: 'Reactivar múltiples eventos' })
//   @ApiOkResponse({
//     description: 'Eventos reactivados exitosamente',
//     type: [Event],
//   })
//   @ApiBadRequestResponse({
//     description: 'IDs inválidos o eventos no existen',
//   })
//   @Patch('reactivate/all')
//   reactivateAll(
//     @Body() deleteEventsDto: DeleteEventsDto,
//     @GetUser() user: UserData,
//   ): Promise<BaseApiResponse<Event[]>> {
//     return this.eventService.reactivateMany(deleteEventsDto.ids, user);
//   }
}
