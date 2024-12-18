// src/modules/billing/services/billing.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderService } from '@pay/pay/services/order.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderStatus, OrderType } from '@pay/pay/interfaces/order.types';
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

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly orderService: OrderService,
    private readonly createProductSaleUseCase: CreateProductSaleOrderUseCase,
    private readonly createMedicalConsultationUseCase: CreateMedicalConsultationOrderUseCase,
    private readonly createMedicalPrescriptionUseCase: CreateMedicalPrescriptionOrderUseCase,
    private readonly medicalConsultationGenerator: MedicalConsultationGenerator,
    private readonly medicalPrescriptionGenerator: MedicalPrescriptionGenerator,
    private readonly productSaleGenerator: ProductSaleGenerator,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Billing',
      billingErrorMessages,
    );
    this.orderService.registerGenerator(this.medicalConsultationGenerator);
    this.orderService.registerGenerator(this.medicalPrescriptionGenerator);
    this.orderService.registerGenerator(this.productSaleGenerator);
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
   * Busca todas las órdenes de un tipo específico
   * @param type - Tipo de orden a buscar
   * @returns Arreglo de órdenes del tipo especificado
   * @throws {Error} Si hay un problema al obtener las órdenes
   */
  async findAllByType(type: OrderType): Promise<Order[]> {
    try {
      return await this.orderService.findByType(type);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una orden específica por su ID y tipo
   * @param type - Tipo de orden esperado
   * @param id - Identificador de la orden
   * @returns La orden encontrada
   * @throws {NotFoundException} Si la orden no existe o no coincide con el tipo
   */
  async findOne(type: OrderType, id: string): Promise<Order> {
    try {
      const order = await this.orderService.findOrderById(id);
      if (order.type !== type) {
        throw new NotFoundException(
          `Order with ID ${id} is not of type ${type}`,
        );
      }
      return order;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca órdenes por tipo y estado
   * @param type - Tipo de orden
   * @param status - Estado de la orden
   * @returns Arreglo de órdenes del tipo y estado especificados
   * @throws {Error} Si hay un problema al obtener las órdenes
   */
  async findByStatus(type: OrderType, status: OrderStatus): Promise<Order[]> {
    try {
      const orders = await this.orderService.findByStatus(status);
      return orders.filter((order) => order.type === type);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
