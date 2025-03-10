// libs/pay/src/services/order.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { Order } from '../entities/order.entity';
import { IOrderGenerator } from '../interfaces';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { orderErrorMessages } from '../errors/errors-order';
import { OrderStatus, OrderType } from '../interfaces/order.types';
import { UserData } from '@login/login/interfaces';
import {
  CreateOrderDto,
  DeleteOrdersDto,
  SubmitDraftOrderDto,
  UpdateOrderDto,
} from '../interfaces/dto';
import {
  UpdateOrderUseCase,
  CreateOrderUseCase,
  DeleteOrdersUseCase,
  ReactivateOrdersUseCase,
  FindOrdersByStatusUseCase,
  SubmitDraftOrderUseCase,
  CompleteOrderUseCase,
} from '../use-cases';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly generators: Map<string, IOrderGenerator> = new Map();
  private readonly errorHandler: BaseErrorHandler;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    private readonly deleteOrdersUseCase: DeleteOrdersUseCase,
    private readonly reactivateOrdersUseCase: ReactivateOrdersUseCase,
    private readonly findOrderByStatusUseCase: FindOrdersByStatusUseCase,
    private readonly submitDraftOrderUseCase: SubmitDraftOrderUseCase,
    private readonly completeOrderUseCase: CompleteOrderUseCase,
  ) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Order',
      orderErrorMessages,
    );
  }

  /**
   * Registra un generador de órdenes para un tipo específico
   * @param generator - Generador de órdenes a registrar
   * @throws {BadRequestException} Si el generador no tiene un tipo definido o ya existe un generador para ese tipo
   */
  registerGenerator(generator: IOrderGenerator) {
    try {
      if (!generator.type) {
        throw new BadRequestException(
          'El generador debe tener un tipo definido',
        );
      }
      if (this.generators.has(generator.type)) {
        throw new BadRequestException(
          `Ya existe un generador registrado para el tipo: ${generator.type}`,
        );
      }
      this.generators.set(generator.type, generator);
      this.logger.log(`Generator registered for type: ${generator.type}`);
    } catch (error) {
      this.errorHandler.handleError(error, 'processing');
    }
  }

  /**
   * Crea una orden utilizando un generador específico
   * @param type - Tipo de orden a crear
   * @param input - Datos de entrada para generar la orden
   * @returns Una orden creada
   * @throws {BadRequestException} Si no se encuentra un generador para el tipo especificado
   */
  async createOrder(type: string, input: any): Promise<Order> {
    try {
      const generator = this.generators.get(type);
      if (!generator) {
        throw new BadRequestException(
          `No se encontró un generador para el tipo: ${type}`,
        );
      }

      const orderData = await generator.generate(input);
      const order = await this.orderRepository.create(orderData);

      this.logger.log(`Order created successfully with ID: ${order.id}`);
      return order;
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Crea una nueva orden
   * @param createOrderDto - DTO con los datos de la orden a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la orden creada
   * @throws {BadRequestException} Si hay un error en la creación de la orden
   */
  async create(
    createOrderDto: CreateOrderDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      return await this.createOrderUseCase.execute(createOrderDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  /**
   * Actualiza una orden existente
   * @param id - Identificador de la orden a actualizar
   * @param updateData - Datos para actualizar la orden
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con la orden actualizada
   * @throws {BadRequestException} Si la orden no se encuentra
   */
  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      const currentOrder = await this.findOrderById(id);

      if (!validateChanges(updateOrderDto, currentOrder)) {
        return {
          success: true,
          message: 'No se detectaron cambios en la sucursal',
          data: currentOrder,
        };
      }

      return await this.updateOrderUseCase.execute(id, updateOrderDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'updating');
    }
  }

  /**
   * Elimina múltiples órdenes
   * @param deleteOrdersDto - DTO con los identificadores de las órdenes a eliminar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las órdenes eliminadas
   * @throws {BadRequestException} Si hay un error al eliminar las órdenes
   */
  async deleteMany(
    deleteOrdersDto: DeleteOrdersDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order[]>> {
    try {
      validateArray(deleteOrdersDto.ids, 'IDs de ordenes');
      return await this.deleteOrdersUseCase.execute(deleteOrdersDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'deactivating');
    }
  }

  /**
   * Reactiva múltiples órdenes
   * @param ids - Arreglo de identificadores de las órdenes a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta HTTP con las órdenes reactivadas
   * @throws {BadRequestException} Si hay un error al reactivar las órdenes
   */
  async reactiveMany(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Order[]>> {
    try {
      validateArray(ids, 'IDs de ordenes');
      return await this.reactivateOrdersUseCase.execute(ids, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'reactivating');
    }
  }

  /**
   * Busca una orden por su identificador
   * @param id - Identificador de la orden
   * @returns La orden encontrada
   * @throws {BadRequestException} Si la orden no se encuentra
   */
  async findOrderById(id: string): Promise<Order> {
    try {
      return await this.orderRepository.findById(id);
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todas las órdenes
   * @returns Arreglo de órdenes
   * @throws {BadRequestException} Si hay un error al obtener las órdenes
   */
  async findAll(): Promise<Order[]> {
    try {
      return this.orderRepository.findMany({
        orderBy: {
          date: 'desc',
        },
      }{
        where: {
          isActive: true,
        },
        include: {
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Obtiene todas las órdenes activas
   * @returns Arreglo de órdenes
   * @throws {BadRequestException} Si hay un error al obtener las órdenes
   */
  async findAllActive(): Promise<Order[]> {
    try {
      return await this.orderRepository.findManyActive({
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca órdenes por tipo
   * @param type - Tipo de orden
   * @returns Arreglo de órdenes del tipo especificado
   * @throws {BadRequestException} Si hay un error al obtener las órdenes
   */
  async findByType(type: OrderType): Promise<Order[]> {
    try {
      return this.orderRepository.findMany({
        where: { type, isActive: true },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca órdenes por estado
   * @param status - Estado de la orden
   * @returns Arreglo de órdenes con el estado especificado
   * @throws {BadRequestException} Si hay un error al obtener las órdenes
   */
  async findByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      return this.orderRepository.findMany({
        where: { status, isActive: true },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca ordenes por estado
   * @param status - Estado de orden a buscar
   * @returns Lista de ordenes que coinciden con el estado especificado
   * @throws {BadRequestException} Si hay un error al obtener los pagos
   */
  async findOrderByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      return await this.findOrderByStatusUseCase.execute(status);
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
  async findOrderByStatusType(
    type: OrderType,
    status: OrderStatus,
  ): Promise<Order[]> {
    try {
      // const orders = await this.findByStatus(status);
      // return orders.filter((order) => order.type === type);
      return this.orderRepository.findMany({
        where: { type, status, isActive: true },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async submitDraftOrder(
    id: string,
    submitDto: SubmitDraftOrderDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      return await this.submitDraftOrderUseCase.execute(id, submitDto, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'submitting');
    }
  }

  async completeOrder(
    id: string,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      return await this.completeOrderUseCase.execute(id, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'processing');
    }
  }
}
