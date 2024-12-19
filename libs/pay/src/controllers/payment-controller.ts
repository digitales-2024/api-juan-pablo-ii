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
  ProcessPaymentDto,
  RejectPaymentDto,
  UpdatePaymentDto,
  VerifyPaymentDto,
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
    return this.paymentService.create(createPaymentDto, user);
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
    return this.paymentService.update(id, updatePaymentDto, user);
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
    return this.paymentService.deleteMany(deletePaymentsDto, user);
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
    return this.paymentService.reactiveMany(body.ids, user);
  }

  // @Get('list')
  // @ApiOperation({ summary: 'Get payments with filters and pagination' })
  // @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  // @ApiQuery({ name: 'paymentMethod', enum: PaymentMethod, required: false })
  // @ApiQuery({ name: 'orderId', required: false })
  // @ApiQuery({ name: 'dateFrom', required: false })
  // @ApiQuery({ name: 'dateTo', required: false })
  // @ApiQuery({ name: 'page', required: false, type: Number })
  // @ApiQuery({ name: 'limit', required: false, type: Number })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of payments with pagination',
  // })
  // async findAllWithFilters(
  //   @Query() filters: PaymentFiltersDto,
  // ): Promise<PaginatedPaymentsResponse> {
  //   console.log('Received filters:', filters);
  //   const result = this.paymentService.findAllWithFilters(filters);
  //   console.log('Result:', result);
  //   return result;
  // }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process a pending payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: Payment,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment processing request',
  })
  async processPayment(
    @Param('id') id: string,
    @Body() processPaymentDto: ProcessPaymentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Payment>> {
    return this.paymentService.processPayment(id, processPaymentDto, user);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify a processing payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully',
    type: Payment,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment verification request',
  })
  async verifyPayment(
    @Param('id') id: string,
    @Body() verifyPaymentDto: VerifyPaymentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Payment>> {
    return this.paymentService.verifyPayment(id, verifyPaymentDto, user);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a processing payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment rejected successfully',
    type: Payment,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment rejection request',
  })
  async rejectPayment(
    @Param('id') id: string,
    @Body() rejectPaymentDto: RejectPaymentDto,
    @GetUser() user: UserData,
  ): Promise<HttpResponse<Payment>> {
    return this.paymentService.rejectPayment(id, rejectPaymentDto, user);
  }
}
