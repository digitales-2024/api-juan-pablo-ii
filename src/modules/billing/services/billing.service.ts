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
import {
  CreateMedicalAppointmentBillingDto,
  CreateMedicalPrescriptionBillingDto,
} from '../dto';
import { AppointmentGenerator } from '../generators/appointment.generator';
import { CreateMedicalPrescriptionUseCase } from '../use-cases/create-medical-prescription-billing.use-case';
import { MedicalPrescriptionGenerator } from '../generators/medical-prescription.generator';

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
    private readonly createMedicalPrescriptionUseCase: CreateMedicalPrescriptionUseCase,
    private readonly medicalPrescriptionGenerator: MedicalPrescriptionGenerator,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Billing',
      billingErrorMessages,
    );
    // this.orderService.registerGenerator(this.productPurchaseGenerator);
    this.orderService.registerGenerator(this.productSaleGenerator);
    this.orderService.registerGenerator(this.appointmentGenerator);
    this.orderService.registerGenerator(this.medicalPrescriptionGenerator);
  }

  /**
   * Crea una orden de facturación para una cita médica.
   * @param createDto Datos para crear la orden de facturación
   * @param user Usuario que realiza la acción
   * @returns Orden creada
   */
  async createMedicalAppointment(
    createDto: CreateMedicalAppointmentBillingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      return await this.createAppointmentOrderUseCase.execute(createDto, user);
    } catch (error) {
      this.logger.error(
        `Error al crear orden de facturación para cita médica: ${error.message}`,
        error.stack,
      );
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Crea una orden de facturación para una receta médica.
   * @param createDto Datos para crear la orden de facturación
   * @param user Usuario que realiza la acción
   * @returns Orden creada
   */
  async createMedicalPrescription(
    createDto: CreateMedicalPrescriptionBillingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      const response = await this.createMedicalPrescriptionUseCase.execute(
        createDto,
        user,
      );

      // Verificar si hay productos no disponibles
      if ('unavailableProducts' in response.data) {
        throw new BadRequestException('Algunos productos no están disponibles');
      }

      return {
        success: true,
        message: 'Órden por Receta médica creada exitosamente',
        data: response.data as Order,
      };
    } catch (error) {
      this.logger.error(
        `Error al crear orden de facturación para receta médica: ${error.message}`,
        error.stack,
      );
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Crea una orden de facturación para una venta de productos.
   * @param createDto Datos para crear la orden de facturación
   * @param user Usuario que realiza la acción
   * @returns Orden creada
   */
  async createProductSale(
    createDto: CreateProductSaleBillingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      const response = await this.createProductSaleUseCase.execute(
        createDto,
        user,
      );

      // Verificar si hay productos no disponibles
      if ('unavailableProducts' in response.data) {
        throw new BadRequestException('Algunos productos no están disponibles');
      }

      return {
        success: true,
        message: 'Venta de producto creada exitosamente',
        data: response.data as Order,
      };
    } catch (error) {
      this.logger.error(
        `Error al crear orden de facturación para venta de productos: ${error.message}`,
        error.stack,
      );
      this.errorHandler.handleError(error, 'creating');
    }
  }

  // Otros métodos del servicio...
}
