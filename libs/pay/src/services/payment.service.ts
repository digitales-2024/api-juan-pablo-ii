import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Payment } from '../entities/payment.entity';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import {
  CreatePaymentDto,
  DeletePaymentsDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  RejectPaymentDto,
  UpdatePaymentDto,
  VerifyPaymentDto,
} from '../interfaces/dto';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { paymentErrorMessages } from '../errors/errors-payment';
import { PaymentRepository } from '../repositories/payment.repository';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import {
  CancelPaymentUseCase,
  CreatePaymentUseCase,
  DeletePaymentsUseCase,
  FindPaymentsByStatusUseCase,
  ProcessPaymentUseCase,
  ReactivatePaymentsUseCase,
  RefundPaymentUseCase,
  RejectPaymentUseCase,
  UpdatePaymentUseCase,
  VerifyPaymentUseCase,
} from '../use-cases';
import { PaymentStatus, PaymentType } from '../interfaces/payment.types';

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
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly verifyPaymentUseCase: VerifyPaymentUseCase,
    private readonly rejectPaymentUseCase: RejectPaymentUseCase,
    private readonly cancelPaymentUseCase: CancelPaymentUseCase,
    private readonly findPaymentsByStatusUseCase: FindPaymentsByStatusUseCase,
    private readonly refundPaymentUseCase: RefundPaymentUseCase,
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
  async create(
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
  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    try {
      const currentPayment = await this.findPaymentById(id);

      if (!validateChanges(updatePaymentDto, currentPayment)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No se detectaron cambios en la sucursal',
          data: currentPayment,
        };
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
  async deleteMany(
    deletePaymentsDto: DeletePaymentsDto,
    user: UserData,
  ): Promise<HttpResponse<Payment[]>> {
    try {
      validateArray(deletePaymentsDto.ids, 'IDs de pagos');
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
  async reactiveMany(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Payment[]>> {
    try {
      validateArray(ids, 'IDs de pagos');
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
      return this.paymentRepository.findById(id);
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

  /**
   * Procesa un pago
   * @param id - Identificador del pago a procesar
   * @param processPaymentDto - DTO con los datos para procesar el pago
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el resultado del procesamiento
   * @throws {BadRequestException} Si hay un error en el procesamiento del pago
   */
  async processPayment(
    id: string,
    processPaymentDto: ProcessPaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    try {
      return await this.processPaymentUseCase.execute(
        id,
        processPaymentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'processing');
    }
  }

  /**
   * Verifica un pago
   * @param id - Identificador del pago a verificar
   * @param verifyPaymentDto - DTO con los datos para verificar el pago
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el resultado de la verificación
   * @throws {BadRequestException} Si hay un error en la verificación del pago
   */
  async verifyPayment(
    id: string,
    verifyPaymentDto: VerifyPaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    try {
      return await this.verifyPaymentUseCase.execute(
        id,
        verifyPaymentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'verifying');
    }
  }

  /**
   * Rechaza un pago
   * @param id - Identificador del pago a rechazar
   * @param rejectPaymentDto - DTO con los datos para rechazar el pago
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el resultado del rechazo
   * @throws {BadRequestException} Si hay un error en el rechazo del pago
   */
  async rejectPayment(
    id: string,
    rejectPaymentDto: RejectPaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    try {
      return await this.rejectPaymentUseCase.execute(
        id,
        rejectPaymentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'rejecting');
    }
  }

  /**
   * Cancela un pago
   * @param id - Identificador del pago a cancelar
   * @param cancelPaymentDto - DTO con los datos para cancelar el pago
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el resultado de la cancelación
   * @throws {BadRequestException} Si el pago no está pendiente o hay un error en la cancelación
   */
  /*   async cancelPayment(
    id: string,
    cancelPaymentDto: CancelPaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    try {
      const payment = await this.findPaymentById(id);
      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException(
          'Solo se pueden cancelar pagos pendientes',
        );
      }
      return await this.cancelPaymentUseCase.execute(
        id,
        cancelPaymentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'cancelling');
    }
  } */

  /**
   * Procesa un reembolso para un pago
   * @param id - Identificador del pago a reembolsar
   * @param refundPaymentDto - DTO con los datos del reembolso
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con el resultado del reembolso
   * @throws {BadRequestException} Si el pago no existe o no puede ser reembolsado
   */
  async refundPayment(
    id: string,
    refundPaymentDto: RefundPaymentDto,
    user: UserData,
  ): Promise<HttpResponse<Payment>> {
    try {
      return await this.refundPaymentUseCase.execute(
        id,
        refundPaymentDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'processing');
    }
  }

  async findPaymentsByStatusAndType(
    status: PaymentStatus,
    type?: PaymentType,
  ): Promise<{
    payments: Payment[];
    typeStats: any;
  }> {
    try {
      return await this.findPaymentsByStatusUseCase.execute({
        status,
        type,
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
