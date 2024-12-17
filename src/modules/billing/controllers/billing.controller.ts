// src/modules/billing/controllers/billing.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { UserData } from '@login/login/interfaces';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateMedicalConsultationOrderUseCase } from '../use-cases/create-medical-consultation-billing.use-case';
import { CreateMedicalConsultationBillingDto } from '../dto/create-medical-consultation-billing.dto';

/**
 * Controlador REST para gestionar sucursales.
 * Expone endpoints para operaciones CRUD sobre sucursales.
 */
@ApiTags('Billing')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'biling', version: '1' })
@Auth()
export class BillingController {
  constructor(
    private readonly createServiceBillingUseCase: CreateMedicalConsultationOrderUseCase,
  ) {}

  @Post('medical-consultation-order')
  async createMedicalConsultationBilling(
    @Body() dto: CreateMedicalConsultationBillingDto,
    @GetUser() user: UserData,
  ) {
    return this.createServiceBillingUseCase.execute(dto, user);
  }
}
