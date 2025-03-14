import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { AppointmentService } from '../services/appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Appointment } from '../entities/appointment.entity';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { DeleteAppointmentsDto } from '../dto/delete-appointments.dto';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { NoShowAppointmentDto } from '../dto/no-show-appointment.dto';
import { RefundAppointmentDto } from '../dto/refund-appointment.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';

@ApiTags('Appointments')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'appointments', version: '1' })
@Auth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  /**
   * Crea una nueva cita médica
   */
  @Post()
  @ApiOperation({ summary: 'Crear nueva cita médica' })
  @ApiCreatedResponse({
    description: 'Cita médica creada exitosamente',
    type: Appointment,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o horario no disponible',
  })
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    return this.appointmentService.create(createAppointmentDto, user);
  }

  /**
   * Obtiene todas las citas médicas con filtros opcionales
   */

  /**
   * Obtiene todas las citas médicas de forma paginada
   */
  @Get('paginated')
  @ApiOperation({ summary: 'Obtener todas las citas médicas de forma paginada' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página para la paginación',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de registros por página',
  })
  @ApiOkResponse({
    description: 'Lista de citas médicas paginadas',
    type: [Appointment],
  })
  async findAllPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ appointments: Appointment[]; total: number }> {

    return this.appointmentService.findAllPaginated(page, limit);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las citas médicas' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Fecha inicial para filtrar citas',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Fecha final para filtrar citas',
  })
  @ApiOkResponse({
    description: 'Lista de todas las citas médicas',
    type: [Appointment],
  })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Appointment[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.appointmentService.findAll(start, end);
  }

  /**
   * Obtiene una cita médica por su ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener cita médica por ID' })
  @ApiOkResponse({
    description: 'Cita médica encontrada',
    type: Appointment,
  })
  findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentService.findOne(id);
  }

  /**
   * Obtiene citas médicas por paciente
   */
  @Get('patient/:pacienteId')
  @ApiOperation({ summary: 'Obtener citas médicas por paciente' })
  @ApiOkResponse({
    description: 'Lista de citas médicas del paciente',
    type: [Appointment],
  })
  findByPatient(
    @Param('pacienteId') pacienteId: string,
  ): Promise<Appointment[]> {
    return this.appointmentService.findByPatient(pacienteId);
  }

  /**
   * Obtiene citas médicas por personal médico
   */
  @Get('staff/:personalId')
  @ApiOperation({ summary: 'Obtener citas médicas por personal médico' })
  @ApiOkResponse({
    description: 'Lista de citas médicas del personal médico',
    type: [Appointment],
  })
  findByStaff(@Param('personalId') personalId: string): Promise<Appointment[]> {
    return this.appointmentService.findByStaff(personalId);
  }

  /**
   * Actualiza una cita médica existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cita médica existente' })
  @ApiOkResponse({
    description: 'Cita médica actualizada exitosamente',
    type: Appointment,
  })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    return this.appointmentService.update(id, updateAppointmentDto, user);
  }

  /**
   * Desactiva múltiples citas médicas
   */
  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples citas médicas' })
  @ApiResponse({
    status: 200,
    description: 'Citas médicas desactivadas exitosamente',
    type: [Appointment],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o citas médicas no existen',
  })
  deleteMany(
    @Body() deleteAppointmentsDto: DeleteAppointmentsDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Appointment[]>> {
    return this.appointmentService.deleteMany(deleteAppointmentsDto, user);
  }

  /**
   * Reactiva múltiples citas médicas
   */
  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples citas médicas' })
  @ApiOkResponse({
    description: 'Citas médicas reactivadas exitosamente',
    type: [Appointment],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o citas médicas no existen',
  })
  reactivateAll(
    @Body() deleteAppointmentsDto: DeleteAppointmentsDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Appointment[]>> {
    return this.appointmentService.reactivateMany(
      deleteAppointmentsDto.ids,
      user,
    );
  }

  /**
   * Cancela una cita médica
   */
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar cita médica' })
  @ApiOkResponse({
    description: 'Cita médica cancelada exitosamente',
    type: Appointment,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o cita no encontrada',
  })
  cancel(
    @Param('id') id: string,
    @Body() cancelAppointmentDto: CancelAppointmentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    return this.appointmentService.cancel(id, cancelAppointmentDto, user);
  }

  /**
   * Reembolsa una cita médica y actualiza sus órdenes y pagos asociados
   */
  @Patch(':id/refund')
  @ApiOperation({ summary: 'Reembolsar cita médica' })
  @ApiOkResponse({
    description: 'Cita médica reembolsada exitosamente',
    type: Appointment,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o cita no encontrada',
  })
  refund(
    @Param('id') id: string,
    @Body() refundAppointmentDto: RefundAppointmentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    return this.appointmentService.refund(id, refundAppointmentDto, user);
  }

  /**
   * Marca una cita médica como NO_SHOW (paciente no se presentó)
   */
  @Patch(':id/no-show')
  @ApiOperation({ summary: 'Marcar cita médica como NO_SHOW' })
  @ApiOkResponse({
    description: 'Cita médica marcada como NO_SHOW exitosamente',
    type: Appointment,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o cita no encontrada',
  })
  markAsNoShow(
    @Param('id') id: string,
    @Body() noShowAppointmentDto: NoShowAppointmentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    return this.appointmentService.markAsNoShow(id, noShowAppointmentDto, user);
  }

  /**
   * Reprograma una cita médica
   */
  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reprogramar cita médica' })
  @ApiOkResponse({
    description: 'Cita médica reprogramada exitosamente',
    type: Appointment,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o cita no encontrada',
  })
  reschedule(
    @Param('id') id: string,
    @Body() rescheduleAppointmentDto: RescheduleAppointmentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Appointment>> {
    return this.appointmentService.reschedule(id, rescheduleAppointmentDto, user);
  }

}
