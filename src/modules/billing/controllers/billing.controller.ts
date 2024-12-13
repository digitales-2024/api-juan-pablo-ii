// src/modules/billing/controllers/billing.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { CreateServiceBillingUseCase } from '../use-cases/create-service-billing.use-case';
import { CreateServiceBillingDto } from '../dto/create-service-billing.dto';
import { UserData } from '@login/login/interfaces';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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
    private readonly createServiceBillingUseCase: CreateServiceBillingUseCase,
  ) {}

  @Post('service-billing')
  async createServiceBilling(
    @Body() dto: CreateServiceBillingDto,
    @GetUser() user: UserData,
  ) {
    return this.createServiceBillingUseCase.execute(dto, user);
  }
}
