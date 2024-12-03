import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { AppointmentType } from '../entities/appointment-type.entity';
import {
  CreateAppointmentTypeDto,
  DeleteAppointmentTypesDto,
  UpdateAppointmentTypeDto,
} from '../dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AppointmentTypeService } from '../services/appointment-type.service';

@ApiTags('AppointmentTypes')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'appointment-types', version: '1' })
@Auth()
export class AppointmentTypeController {
  constructor(
    private readonly appointmentTypeService: AppointmentTypeService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo de cita' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de cita creado exitosamente',
    type: AppointmentType,
  })
  create(
    @Body() createAppointmentTypeDto: CreateAppointmentTypeDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<AppointmentType>> {
    return this.appointmentTypeService.create(createAppointmentTypeDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tipos de cita' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los tipos de cita',
    type: [AppointmentType],
  })
  findAll(): Promise<AppointmentType[]> {
    return this.appointmentTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de cita por ID' })
  @ApiResponse({
    status: 200,
    type: AppointmentType,
  })
  findOne(@Param('id') id: string): Promise<AppointmentType> {
    return this.appointmentTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tipo de cita' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de cita actualizado exitosamente',
    type: AppointmentType,
  })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentTypeDto: UpdateAppointmentTypeDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<AppointmentType>> {
    return this.appointmentTypeService.update(
      id,
      updateAppointmentTypeDto,
      user,
    );
  }
  /**
   * Desactiva múltiples tipos de citas
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples tipos de citas' })
  @ApiResponse({
    status: 200,
    description: 'Tipos de citas desactivados exitosamente',
    type: [AppointmentType],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o tipos de citas no existen',
  })
  deleteMany(
    @Body() deleteAppointmentTypesDto: DeleteAppointmentTypesDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<AppointmentType[]>> {
    return this.appointmentTypeService.deleteMany(
      deleteAppointmentTypesDto,
      user,
    );
  }
}
