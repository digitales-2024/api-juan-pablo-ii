// src/modules/billing/controllers/billing.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import { UserData } from '@login/login/interfaces';
import { OrderType, OrderStatus } from '@pay/pay/interfaces/order.types';
import { BillingService } from '../services/billing.service';
import { CreateMedicalConsultationBillingDto } from '../dto';
import { Order } from '@pay/pay/entities/order.entity';
import { HttpResponse } from '@login/login/interfaces';
import { CreateMedicalPrescriptionBillingDto } from '../dto/create-medical-prescription-billing.dto';
import { CreateProductSaleBillingDto } from '../dto/create-product-sale-billing.dto';

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
  constructor(private readonly billingService: BillingService) {}

  @Post('medical-consultation')
  @ApiOperation({ summary: 'Create medical consultation order' })
  @ApiCreatedResponse({
    description: 'Medical consultation order created successfully',
    type: Order,
  })
  async createMedicalConsultationOrder(
    @Body() createDto: CreateMedicalConsultationBillingDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Order>> {
    return this.billingService.createMedicalConsultation(createDto, user);
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
  ): Promise<HttpResponse<Order>> {
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
  ): Promise<HttpResponse<Order>> {
    return this.billingService.createProductSale(createDto, user);
  }

  @Get(':type')
  @ApiOperation({ summary: 'Get all orders by type' })
  @ApiParam({
    name: 'type',
    enum: OrderType,
    enumName: 'OrderType',
  })
  @ApiOkResponse({
    description: 'Orders found successfully',
    type: [Order],
  })
  async findAllByType(@Param('type') type: OrderType): Promise<Order[]> {
    return this.billingService.findAllByType(type);
  }

  @Get(':type/:id')
  @ApiOperation({ summary: 'Get order by type and ID' })
  @ApiParam({
    name: 'type',
    enum: OrderType,
    enumName: 'OrderType',
  })
  @ApiOkResponse({
    description: 'Order found successfully',
    type: Order,
  })
  async findOne(
    @Param('type') type: OrderType,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Order> {
    return this.billingService.findOne(type, id);
  }

  @Get(':type/status/:status')
  @ApiOperation({ summary: 'Get orders by type and status' })
  @ApiParam({
    name: 'type',
    enum: OrderType,
    enumName: 'OrderType',
  })
  @ApiParam({
    name: 'status',
    enum: OrderStatus,
    enumName: 'OrderStatus',
  })
  @ApiOkResponse({
    description: 'Orders found successfully',
    type: [Order],
  })
  async findByStatus(
    @Param('type') type: OrderType,
    @Param('status') status: OrderStatus,
  ): Promise<Order[]> {
    return this.billingService.findByStatus(type, status);
  }
}
