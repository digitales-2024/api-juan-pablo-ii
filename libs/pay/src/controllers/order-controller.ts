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
import { Order } from '../entities/order.entity';
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

  @Get()
  @ApiOperation({ summary: 'Obtener todas las órdenes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las órdenes',
    type: [Order],
  })
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
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
