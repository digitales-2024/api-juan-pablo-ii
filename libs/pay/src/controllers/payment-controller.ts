import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
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
import { Payment } from '../entities/payment.entity';
import {
  CreatePaymentDto,
  DeletePaymentsDto,
  UpdatePaymentDto,
} from '../interfaces/dto';

@ApiTags('Payment')
@ApiBadRequestResponse({
  description:
    'Bad Request - Error en la validación de datos o solicitud incorrecta',
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized - No autorizado para realizar esta operación',
})
@Controller({ path: 'payment', version: '1' })
@Auth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo pago' })
  @ApiResponse({
    status: 201,
    description: 'Pago creado exitosamente',
    type: Payment,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos',
  })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Payment>> {
    return this.paymentService.createPayment(createPaymentDto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiOkResponse({
    description: 'Pago encontrado',
    type: Payment,
  })
  @ApiBadRequestResponse({
    description: 'ID de pago inválido',
  })
  findOne(@Param('id') id: string): Promise<Payment> {
    return this.paymentService.findPaymentById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pagos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los pagos',
    type: [Payment],
  })
  findAll(): Promise<Payment[]> {
    return this.paymentService.findAll();
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar pago existente' })
  @ApiResponse({
    status: 200,
    description: 'Pago actualizado exitosamente',
    type: Payment,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o pago no encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Payment>> {
    return this.paymentService.updatePayment(id, updatePaymentDto, user);
  }

  @Delete('remove/all')
  @ApiOperation({ summary: 'Desactivar múltiples pagos' })
  @ApiResponse({
    status: 200,
    description: 'Pagos desactivados exitosamente',
    type: [Payment],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o pagos no existen',
  })
  deleteMany(
    @Body() deletePaymentsDto: DeletePaymentsDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Payment[]>> {
    return this.paymentService.deletePayments(deletePaymentsDto, user);
  }

  @Patch('reactivate/all')
  @ApiOperation({ summary: 'Reactivar múltiples pagos' })
  @ApiResponse({
    status: 200,
    description: 'Pagos reactivados exitosamente',
    type: [Payment],
  })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o pagos no existen',
  })
  reactivateAll(
    @Body() body: { ids: string[] },
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Payment[]>> {
    return this.paymentService.reactivatePayments(body.ids, user);
  }
}
