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
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Order } from '../entities/order.entity';
import { DeleteOrdersDto, UpdateOrderDto } from '../interfaces/dto';
import { CreateOrderDto } from '../interfaces/dto/create-order.dto';

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
  ): Promise<HttpResponse<Order>> {
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
  ): Promise<HttpResponse<Order>> {
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
  ): Promise<HttpResponse<Order[]>> {
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
  ): Promise<HttpResponse<Order[]>> {
    return this.orderService.reactiveMany(deleteOrdersDto.ids, user);
  }
}
