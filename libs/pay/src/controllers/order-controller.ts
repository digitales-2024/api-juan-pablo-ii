import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  Get,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { Auth, GetUser } from '@login/login/admin/auth/decorators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserData } from '@login/login/interfaces';
import { DetailedOrder, Order } from '../entities/order.entity';
import {
  CreateOrderDto,
  DeleteOrdersDto,
  SubmitDraftOrderDto,
  UpdateOrderDto,
} from '../interfaces/dto';
import { OrderStatus, OrderType } from '../interfaces/order.types';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@ApiTags('Order')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'order', version: '1' })
@Auth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva orden' })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos',
  })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.orderService.create(createOrderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las órdenes',
    type: [DetailedOrder],
  })
  findAll(): Promise<DetailedOrder[]> {
    return this.orderService.findAll();
  }

  @Get('/active')
  @ApiOperation({ summary: 'Obtener todas las órdenes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las órdenes',
    type: [Order],
  })
  findAllActive(): Promise<Order[]> {
    return this.orderService.findAllActive();
  }

  @Get('type/:type') // Cambiado de ':type' a 'type/:type'
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
    return this.orderService.findByType(type);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get payments by status' })
  @ApiParam({
    name: 'status',
    enum: OrderStatus,
    description: 'Payment status to filter by',
  })
  @ApiResponse({
    status: 200,
    description: 'List of payments with the specified status',
    type: [Order],
  })
  async findByStatus(@Param('status') status: OrderStatus): Promise<Order[]> {
    return this.orderService.findOrderByStatus(status);
  }

  @Get('/detailed/code/:code')
  @ApiOperation({ summary: 'Obtener orden por código' })
  @ApiParam({ name: 'id', description: 'Código de la orden' })
  @ApiOkResponse({
    description: 'Orden encontrada',
    type: DetailedOrder,
  })
  @ApiBadRequestResponse({
    description: 'Code de orden inválido',
  })
  findOneDetailedByCode(@Param('code') code: string): Promise<DetailedOrder> {
    return this.orderService.findDetailedOrderByCode(code);
  }

  @Get('/detailed/:id')
  @ApiOperation({ summary: 'Obtener orden por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiOkResponse({
    description: 'Orden encontrada',
    type: DetailedOrder,
  })
  @ApiBadRequestResponse({
    description: 'ID de orden inválido',
  })
  findOneDetailed(@Param('id') id: string): Promise<DetailedOrder> {
    return this.orderService.findDetailedOrderById(id);
  }

  @Get('/search/detailed/code/:code')
  @ApiOperation({ summary: 'Obtener orden por código' })
  @ApiParam({ name: 'code', description: 'Código de la orden' })
  @ApiOkResponse({
    description: 'Orden encontrada',
    type: [DetailedOrder],
  })
  @ApiBadRequestResponse({
    description: 'Código de orden inválido',
  })
  searchOneDetailed(@Param('code') code: string): Promise<DetailedOrder[]> {
    return this.orderService.searchDetailedOrderByCode(code);
  }

  //No direct relationship with Patient Dni in Order Table
  // @Get('/search/detailed/:dni')
  // @ApiOperation({ summary: 'Obtener orden por dni del paciente' })
  // @ApiParam({ name: 'dni', description: 'Dni del paciente en la orden' })
  // @ApiOkResponse({
  //   description: 'Orden encontrada',
  //   type: [DetailedOrder],
  // })
  // @ApiBadRequestResponse({
  //   description: 'Dni del paciente para la órden inválido',
  // })
  // findDetailedOrderByPatientDni(
  //   @Param('dni') dni: string,
  // ): Promise<DetailedOrder[]> {
  //   return this.orderService.findDetailedOrderByPatientDni(dni);
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener orden por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiOkResponse({
    description: 'Orden encontrada',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'ID de orden inválido',
  })
  findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOrderById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar orden existente' })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada exitosamente',
    type: Order,
  })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.orderService.update(id, updateOrderDto, user);
  }

  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples órdenes' })
  @ApiResponse({
    status: 200,
    description: 'Órdenes desactivadas exitosamente',
    type: [Order],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o órdenes no existen',
  })
  deleteMany(
    @Body() deleteOrdersDto: DeleteOrdersDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order[]>> {
    return this.orderService.deleteMany(deleteOrdersDto, user);
  }

  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples órdenes' })
  @ApiOkResponse({
    description: 'Órdenes reactivadas exitosamente',
    type: [Order],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o órdenes no existen',
  })
  reactivateAll(
    @Body() deleteOrdersDto: DeleteOrdersDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order[]>> {
    return this.orderService.reactiveMany(deleteOrdersDto.ids, user);
  }

  @Post(':id/submit-draft')
  @ApiOperation({ summary: 'Confirmar orden borrador y cambiar a pendiente' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden borrador',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden borrador confirmada exitosamente',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Orden no encontrada o no está en estado borrador',
  })
  async submitDraftOrder(
    @Param('id') id: string,
    @Body() submitDto: SubmitDraftOrderDto,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.orderService.submitDraftOrder(id, submitDto, user);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Completar una orden' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a completar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden completada exitosamente',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Orden no encontrada o no puede ser completada',
  })
  async completeOrder(
    @Param('id') id: string,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.orderService.completeOrder(id, user);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar una orden y sus pagos asociados' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a cancelar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada exitosamente',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Orden no encontrada o no puede ser cancelada',
  })
  async cancelOrder(
    @Param('id') id: string,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.orderService.cancelOrder(id, user);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Reembolsar una orden y sus pagos asociados' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a reembolsar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden reembolsada exitosamente',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Orden no encontrada o no puede ser reembolsada',
  })
  async refundOrder(
    @Param('id') id: string,
    @GetUser() user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return this.orderService.refundOrder(id, user);
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
  async findByStatusType(
    @Param('type') type: OrderType,
    @Param('status') status: OrderStatus,
  ): Promise<Order[]> {
    return this.orderService.findOrderByStatusType(type, status);
  }
}
