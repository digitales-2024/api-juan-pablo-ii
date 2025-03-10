import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { ApponitmentUserService } from '../services/apponitment-user.service';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import { UpdateAppointmentUserDto } from '../dto/update-apponitment-user.dto';
import { AppointmentResponse } from '../entities/apponitment-user..entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@ApiTags('Appointment-user')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'appointments-user', version: '1' })
@Auth()
export class ApponitmentUserController {
  constructor(
    private readonly apponitmentUserService: ApponitmentUserService,
  ) {}

  // ENDPOINTS PARA MÉDICOS

  /**
   * Obtiene todas las citas CONFIRMADAS del médico
   */
  @Get('/doctor/:id/confirmed')
  @ApiOperation({ summary: 'Obtener citas confirmadas del médico' })
  @ApiResponse({
    status: 200,
    description: 'Lista de citas confirmadas',
    type: [AppointmentResponse],
  })
  getConfirmedForDoctor(
    @Param('id') id: string,
  ): Promise<AppointmentResponse[]> {
    return this.apponitmentUserService.getConfirmedForDoctor(id);
  }

  /**
   * Obtiene todas las citas COMPLETADAS del médico
   */
  @Get('/doctor/:id/completed')
  @ApiOperation({ summary: 'Obtener citas completadas del médico' })
  @ApiResponse({
    status: 200,
    description: 'Lista de citas completadas',
    type: [AppointmentResponse],
  })
  getCompletedForDoctor(
    @Param('id') id: string,
  ): Promise<AppointmentResponse[]> {
    return this.apponitmentUserService.getCompletedForDoctor(id);
  }

  // ENDPOINTS PARA ADMINISTRADORES

  /**
   * Obtiene todas las citas CONFIRMADAS (acceso administrativo)
   */
  @Get('/admin/confirmed')
  @ApiOperation({ summary: 'Obtener todas las citas confirmadas (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las citas confirmadas',
    type: [AppointmentResponse],
  })
  getAllConfirmed(): Promise<AppointmentResponse[]> {
    return this.apponitmentUserService.getAllConfirmed();
  }

  /**
   * Obtiene todas las citas COMPLETADAS (acceso administrativo)
   */
  @Get('/admin/completed')
  @ApiOperation({ summary: 'Obtener todas las citas completadas (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las citas completadas',
    type: [AppointmentResponse],
  })
  getAllCompleted(): Promise<AppointmentResponse[]> {
    return this.apponitmentUserService.getAllCompleted();
  }

  // ENDPOINTS PARA PERSONAL DE MESÓN (POR SUCURSAL)

  /**
   * Obtiene citas CONFIRMADAS de la sucursal del usuario
   */
  @Get('/branch/:id/confirmed')
  @ApiOperation({ summary: 'Obtener citas confirmadas por sucursal' })
  @ApiResponse({
    status: 200,
    description: 'Lista de citas confirmadas de la sucursal',
    type: [AppointmentResponse],
  })
  getBranchConfirmed(@Param('id') id: string): Promise<AppointmentResponse[]> {
    return this.apponitmentUserService.getBranchConfirmed(id);
  }

  /**
   * Obtiene citas COMPLETADAS de la sucursal del usuario
   */
  @Get('/branch/:id/completed')
  @ApiOperation({ summary: 'Obtener citas completadas por sucursal' })
  @ApiResponse({
    status: 200,
    description: 'Lista de citas completadas de la sucursal',
    type: [AppointmentResponse],
  })
  getBranchCompleted(@Param('id') id: string): Promise<AppointmentResponse[]> {
    return this.apponitmentUserService.getBranchCompleted(id);
  }

  /**
   * Actualiza el estado de una cita existente
   */
  @Patch('/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de una cita' })
  @ApiResponse({
    status: 200,
    description: 'Cita actualizada exitosamente',
    type: BaseApiResponse,
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppointmentUserDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<AppointmentResponse>> {
    return this.apponitmentUserService.updateStatus(id, updateDto, user);
  }
}
