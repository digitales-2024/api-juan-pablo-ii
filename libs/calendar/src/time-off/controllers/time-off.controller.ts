import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TimeOffService } from '../services/time-off.service';
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
import { TimeOff } from '../entities/time-off.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateTimeOffDto } from '../dto/create-time-off.dto';

/**
 * Controlador REST para gestionar ausencias temporales.
 * Expone endpoints para operaciones CRUD sobre ausencias.
 */
@ApiTags('TimeOff')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'time-off', version: '1' })
@Auth()
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  /**
   * Crea una nueva ausencia temporal.
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva ausencia temporal' })
  @ApiCreatedResponse({
    description: 'Ausencia temporal creada exitosamente',
    type: TimeOff,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o ausencia ya existe',
  })
  create(
    @Body() createTimeOffDto: CreateTimeOffDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<TimeOff>> {
    return this.timeOffService.create(createTimeOffDto, user);
  }

  /**
   * Obtiene una ausencia temporal por su ID.
   */
  @ApiOperation({ summary: 'Obtener ausencia temporal por ID' })
  @ApiParam({ name: 'id', description: 'ID de la ausencia temporal' })
  @ApiOkResponse({
    description: 'Ausencia temporal encontrada',
    type: TimeOff,
  })
  @ApiNotFoundResponse({
    description: 'Ausencia temporal no encontrada',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<TimeOff> {
    return this.timeOffService.findOne(id);
  }

  /**
   * Obtiene todas las ausencias temporales.
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las ausencias temporales' })
  @ApiOkResponse({
    description: 'Lista de todas las ausencias temporales',
    type: [TimeOff],
  })
  findAll(): Promise<TimeOff[]> {
    return this.timeOffService.findAll();
  }
}
