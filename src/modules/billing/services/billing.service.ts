// src/modules/billing/services/billing.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OrderService } from '@pay/pay/services/order.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Order } from '@pay/pay/entities/order.entity';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { billingErrorMessages } from '../errors/errors-billing';
import { CreateMedicalConsultationOrderUseCase } from '../use-cases/create-medical-consultation-billing.use-case';
import { CreateMedicalConsultationBillingDto } from '../dto';
import { MedicalConsultationGenerator } from '../generators/medical-consultation.generator';
import { CreateMedicalPrescriptionBillingDto } from '../dto/create-medical-prescription-billing.dto';
import { CreateMedicalPrescriptionOrderUseCase } from '../use-cases/create-medical-prescription-billing.use-case';
import { MedicalPrescriptionGenerator } from '../generators/medical-prescription.generator';
import { CreateProductSaleBillingDto } from '../dto/create-product-sale-billing.dto';
import { ProductSaleGenerator } from '../generators/product-sale-generator';
import { CreateProductSaleOrderUseCase } from '../use-cases/create-product-sale-billing.use-case';
import { ProductPurchaseGenerator } from '../generators/product-purchase-generator';
import { CreateProductPurchaseBillingDto } from '../dto/create-product-purchase-billing.dto';
import { CreateProductPurchaseOrderUseCase } from '../use-cases/create-product-purchase-billing.use-case';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly orderService: OrderService,
    private readonly createProductSaleUseCase: CreateProductSaleOrderUseCase,
    private readonly createMedicalConsultationUseCase: CreateMedicalConsultationOrderUseCase,
    private readonly createMedicalPrescriptionUseCase: CreateMedicalPrescriptionOrderUseCase,
    private readonly createProductPurchaseUseCase: CreateProductPurchaseOrderUseCase,
    private readonly medicalConsultationGenerator: MedicalConsultationGenerator,
    private readonly medicalPrescriptionGenerator: MedicalPrescriptionGenerator,
    private readonly productSaleGenerator: ProductSaleGenerator,
    private readonly productPurchaseGenerator: ProductPurchaseGenerator,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Billing',
      billingErrorMessages,
    );
    this.orderService.registerGenerator(this.medicalConsultationGenerator);
    this.orderService.registerGenerator(this.medicalPrescriptionGenerator);
    this.orderService.registerGenerator(this.productSaleGenerator);
    this.orderService.registerGenerator(this.productPurchaseGenerator);
  }

  /**
   * Crea una consulta médica
   * @param createDto - DTO con los datos de la consulta médica
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la orden de consulta médica creada
   * @throws {Error} Si hay un problema al crear la consulta médica
   */
  async createMedicalConsultation(
    createDto: CreateMedicalConsultationBillingDto,
    user: UserData,
  ): Promise<HttpResponse<Order>> {
    try {
      return await this.createMedicalConsultationUseCase.execute(
        createDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Crea una prescripción médica
   * @param createDto - DTO con los datos de la prescripción médica
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la orden de prescripción médica creada
   * @throws {Error} Si hay un problema al crear la prescripción médica
   */
  async createMedicalPrescription(
    createDto: CreateMedicalPrescriptionBillingDto,
    user: UserData,
  ): Promise<HttpResponse<Order>> {
    try {
      return await this.createMedicalPrescriptionUseCase.execute(
        createDto,
        user,
      );
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

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
  ): Promise<HttpResponse<Order>> {
    try {
      return await this.createProductSaleUseCase.execute(createDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Crea una orden de compra de productos
   * @param createDto - DTO con los datos de la compra
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la orden de compra creada
   * @throws {Error} Si hay un problema al crear la orden de compra
   */
  async createProductPurchase(
    createDto: CreateProductPurchaseBillingDto,
    user: UserData,
  ): Promise<HttpResponse<Order>> {
    try {
      return await this.createProductPurchaseUseCase.execute(createDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }
}
