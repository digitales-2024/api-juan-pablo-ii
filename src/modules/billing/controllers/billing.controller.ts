// src/modules/billing/controllers/billing.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { BillingService } from '../services/billing.service';
import { Order } from '@pay/pay/entities/order.entity';
// import { CreateMedicalPrescriptionBillingDto } from '../dto/create-medical-prescription-billing.dto';
import { CreateProductSaleBillingDto } from '../dto/create-product-sale-billing.dto';
import { CreateProductPurchaseBillingDto } from '../dto/create-product-purchase-billing.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateMedicalAppointmentBillingDto, CreateMedicalPrescriptionBillingDto } from '../dto';

@ApiTags('Billing')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'billing', version: '1' })
@ApiTags('Billing')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Auth()
export class BillingController {
  constructor(private readonly billingService: BillingService) { }

  @Post('medical-appointment')
  @ApiOperation({ summary: 'Create medical consultation order' })
  @ApiCreatedResponse({
    description: 'Medical appointment order created successfully',
    type: Order,
  })
  async createMedicalConsultationOrder(
    @Body() createDto: CreateMedicalAppointmentBillingDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.billingService.createMedicalAppointment(createDto, user);
  }
  @Post('medical-prescription')
  @ApiOperation({ summary: 'Create medical prescription order' })
  @ApiCreatedResponse({
    description: 'Medical prescription order created successfully',
    type: Order,
  })
  async createMedicalPrescriptionOrder(
    @Body() createDto: CreateMedicalPrescriptionBillingDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.billingService.createMedicalPrescription(createDto, user);
  }

  @Post('product-sale')
  @ApiOperation({ summary: 'Create product sale order' })
  @ApiCreatedResponse({
    description: 'Product sale order created successfully',
    type: Order,
  })
  async createProductSaleOrder(
    @Body() createDto: CreateProductSaleBillingDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.billingService.createProductSale(createDto, user);
  }
  // @Post('product-purchase')
  // @ApiOperation({ summary: 'Create product purchase order' })
  // @ApiCreatedResponse({
  //   description: 'Product purchase order created successfully',
  //   type: Order,
  // })
  // async createProductPurchaseOrder(
  //   @Body() createDto: CreateProductPurchaseBillingDto,
  //   @GetUser() user: UserData,
  // ): Promise<BaseApiResponse<Order>> {
  //   return this.billingService.createProductPurchase(createDto, user);
  // }
}
