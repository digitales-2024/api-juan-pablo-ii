import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentRepository } from '../repositories/payment.repository';
import { Payment } from '../entities/payment.entity';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import {
  CreatePaymentDto,
  DeletePaymentsDto,
  UpdatePaymentDto,
} from '../interfaces/dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { paymentErrorMessages } from '../errors/errors-payment';
import {
  CreatePaymentUseCase,
  DeletePaymentsUseCase,
  ReactivatePaymentsUseCase,
  UpdatePaymentUseCase,
} from '../use-cases';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly deletePaymentsUseCase: DeletePaymentsUseCase,
    private readonly reactivatePaymentsUseCase: ReactivatePaymentsUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Payment',
      paymentErrorMessages, // Add error messages if needed
    );
  }

  /**
   * Crea un nuevo pago
   * @param createPaymentDto - DTO con los datos del pago a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el pago creado
   * @throws {BadRequestException} Si hay un error en la creación del pago
   */
  async createPayment(
    createPaymentDto: CreatePaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    try {
      return await this.createPaymentUseCase.execute(createPaymentDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza un pago existente
   * @param id - Identificador del pago a actualizar
   * @param updatePaymentDto - DTO con los datos para actualizar el pago
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el pago actualizado
   * @throws {BadRequestException} Si el pago no se encuentra o hay un error en la actualización
   */
  async updatePayment(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    try {
      const payment = await this.findPaymentById(id);
      if (!payment) {
        throw new BadRequestException('Pago no encontrado');
      }

      return await this.updatePaymentUseCase.execute(
        id,
        updatePaymentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Actualiza un pago existente
   * @param id - Identificador del pago a actualizar
   * @param updatePaymentDto - DTO con los datos para actualizar el pago
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el pago actualizado
   * @throws {BadRequestException} Si el pago no se encuentra o hay un error en la actualización
   */
  async deletePayments(
    deletePaymentsDto: DeletePaymentsDto,
    user: UserData,
  ): Promise<HttpResponse<Payment[]>> {
    try {
      // Validate the array of IDs
      if (!deletePaymentsDto.ids || deletePaymentsDto.ids.length === 0) {
        throw new BadRequestException('No se proporcionaron IDs de pagos');
      }

      return await this.deletePaymentsUseCase.execute(deletePaymentsDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples pagos previamente eliminados
   * @param ids - Arreglo de identificadores de pagos a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el resultado de la reactivación
   * @throws {BadRequestException} Si no se proporcionan IDs de pagos
   */
  async reactivatePayments(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Payment[]>> {
    try {
      // Validate the array of IDs
      if (!ids || ids.length === 0) {
        throw new BadRequestException('No se proporcionaron IDs de pagos');
      }

      return await this.reactivatePaymentsUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Busca un pago por su identificador
   * @param id - Identificador del pago a buscar
   * @returns Detalles del pago encontrado
   * @throws {BadRequestException} Si el pago no se encuentra
   */
  async findPaymentById(id: string): Promise<Payment> {
    try {
      const payment = await this.paymentRepository.findById(id);
      if (!payment) {
        throw new BadRequestException('Pago no encontrado');
      }
      return payment;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Recupera todos los pagos
   * @returns Lista de todos los pagos
   * @throws {Error} Si hay un problema al recuperar los pagos
   */
  async findAll(): Promise<Payment[]> {
    try {
      return await this.paymentRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
