// src/modules/billing/services/billing.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OrderService } from '@pay/pay/services/order.service';
import { UserData } from '@login/login/interfaces';
import { Order } from '@pay/pay/entities/order.entity';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { billingErrorMessages } from '../errors/errors-billing';
import { CreateProductSaleBillingDto } from '../dto/create-product-sale-billing.dto';
import { ProductSaleGenerator } from '../generators/product-sale-generator';
import { CreateProductSaleOrderUseCase } from '../use-cases/create-product-sale-billing.use-case';
// import { CreateProductPurchaseBillingDto } from '../dto/create-product-purchase-billing.dto';
// import { CreateProductPurchaseOrderUseCase } from '../use-cases/create-product-purchase-billing.use-case';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateAppointmentOrderUseCase } from '../use-cases/create-appointment-billing.use-case';
import { CreateMedicalAppointmentBillingDto } from '../dto';
import { AppointmentGenerator } from '../generators/appointment.generator';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly orderService: OrderService,
    private readonly createProductSaleUseCase: CreateProductSaleOrderUseCase,
    // private readonly createProductPurchaseUseCase: CreateProductPurchaseOrderUseCase,
    private readonly productSaleGenerator: ProductSaleGenerator,
    // private readonly productPurchaseGenerator: ProductPurchaseGenerator,
    private readonly appointmentGenerator: AppointmentGenerator,
    private readonly createAppointmentOrderUseCase: CreateAppointmentOrderUseCase,

  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Billing',
      billingErrorMessages,
    );
    this.orderService.registerGenerator(this.productSaleGenerator);
    // this.orderService.registerGenerator(this.productPurchaseGenerator);
    this.orderService.registerGenerator(this.appointmentGenerator);

  }

  /**
   * Crea una consulta médica
   * @param createDto - DTO con los datos de la consulta médica
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la orden de consulta médica creada
   * @throws {Error} Si hay un problema al crear la consulta médica
   */
  async createMedicalAppointment(
    createDto: CreateMedicalAppointmentBillingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      return await this.createAppointmentOrderUseCase.execute(
        createDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  // /**
  //  * Crea una prescripción médica
  //  * @param createDto - DTO con los datos de la prescripción médica
  //  * @param user - Datos del usuario que realiza la operación
  //  * @returns Respuesta HTTP con la orden de prescripción médica creada
  //  * @throws {Error} Si hay un problema al crear la prescripción médica
  //  */
  // async createMedicalPrescription(
  //   createDto: CreateMedicalPrescriptionBillingDto,
  //   user: UserData,
  // ): Promise<HttpResponse<Order>> {
  //   try {
  //     return await this.createMedicalPrescriptionUseCase.execute(
  //       createDto,
  //       user,
  //     );
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'creating');
  //   }
  // }

  /**
   * Crea una venta de producto
   * @param createDto - DTO con los datos de la venta de producto
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la orden de venta de producto creada
   * @throws {Error} Si hay un problema al crear la venta de producto
   */
  async createProductSale(
    createDto: CreateProductSaleBillingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      const response = await this.createProductSaleUseCase.execute(createDto, user);

      // Verifica si hay productos no disponibles
      if ('unavailableProducts' in response.data) {
        // Lanza una excepción o maneja el error como desees
        throw new BadRequestException('Algunos productos no están disponibles');
      }

      return {
        success: true,
        message: 'Venta de producto creada exitosamente',
        data: response.data as Order,
      };
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
      throw error; // Asegúrate de lanzar el error para que el controlador lo maneje
    }
  }

  // /**
  //  * Crea una orden de compra de productos
  //  * @param createDto - DTO con los datos de la compra
  //  * @param user - Datos del usuario que realiza la operación
  //  * @returns Respuesta HTTP con la orden de compra creada
  //  * @throws {Error} Si hay un problema al crear la orden de compra
  //  */
  // async createProductPurchase(
  //   createDto: CreateProductPurchaseBillingDto,
  //   user: UserData,
  // ): Promise<BaseApiResponse<Order>> {
  //   try {
  //     return await this.createProductPurchaseUseCase.execute(createDto, user);
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'creating');
  //   }
  // }
}
