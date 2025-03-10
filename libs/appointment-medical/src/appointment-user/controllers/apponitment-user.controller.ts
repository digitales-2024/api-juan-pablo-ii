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
import { UpdateAppointmentUserDto } from '../dto';
import { AppointmentMedicalResponse } from '../entities/apponitment-user..entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Controlador REST para gestionar recetas médicas.
 * Expone endpoints para operaciones CRUD sobre recetas.
 */
@ApiTags('Appointment-user')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'receta', version: '1' })
@Auth()
export class ApponitmentUserController {
  constructor(
    private readonly apponitmentUserService: ApponitmentUserService,
  ) {}

  /**
   * Obtiene todas las recetas médicas
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todas las recetas médicas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las recetas médicas',
    type: [AppointmentMedicalResponse],
  })
  findAll(): Promise<AppointmentMedicalResponse[]> {
    return this.apponitmentUserService.findAll();
  }

  /**
   * Actualiza una receta médica existente
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar receta médica existente' })
  @ApiResponse({
    status: 200,
    description: 'Receta médica actualizada exitosamente',
    type: BaseApiResponse<AppointmentMedicalResponse>,
  })
  update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdateAppointmentUserDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<AppointmentMedicalResponse>> {
    return this.apponitmentUserService.update(id, updatePrescriptionDto, user);
  }
}
