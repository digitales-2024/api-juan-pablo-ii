// libs/pay/src/services/order.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { DetailedOrder, Order } from '../entities/order.entity';
import { IOrderGenerator } from '../interfaces';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { orderErrorMessages } from '../errors/errors-order';
import { OrderStatus, OrderType } from '../interfaces/order.types';
import { UserBranchData, UserData } from '@login/login/interfaces';
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
  CancelOrderUseCase,
  RefundOrderUseCase,
} from '../use-cases';
import { validateArray, validateChanges } from '@prisma/prisma/utils';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { PaymentRepository } from '../repositories/payment.repository';
/* import { PaymentStatus } from '../interfaces/payment.types'; */

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
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly refundOrderUseCase: RefundOrderUseCase,
    private readonly paymentRepository: PaymentRepository,
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
   * Busca una orden detallada por su identificador
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
   * Busca una orden por su identificador
   * @param id - Identificador de la orden
   * @returns La orden encontrada
   * @throws {BadRequestException} Si la orden no se encuentra
   */
  async findDetailedOrderById(id: string): Promise<DetailedOrder> {
    try {
      const response = (await this.orderRepository.findById(id, {
        payments: true,
      })) as DetailedOrder;
      return response;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una orden por su identificador
   * @param id - Identificador de la orden
   * @returns La orden encontrada
   * @throws {BadRequestException} Si la orden no se encuentra
   */
  async findDetailedOrderByCode(code: string): Promise<DetailedOrder> {
    try {
      const response = (await this.orderRepository.findOne({
        where: {
          code: code,
        },
        include: {
          payments: true,
        },
      })) as DetailedOrder;
      return response;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Busca una orden por su identificador
   * @param id - Identificador de la orden
   * @returns La orden encontrada
   * @throws {BadRequestException} Si la orden no se encuentra
   */
  async searchDetailedOrderByCode(code: string): Promise<DetailedOrder[]> {
    try {
      const results =
        code === 'None'
          ? ((await this.orderRepository.findMany({
              where: {
                isActive: true,
              },
              orderBy: {
                date: 'desc', // Changed from 'asc' to 'desc' to get newest records first
              },
              include: {
                payments: true,
              },
              take: 10,
            })) as DetailedOrder[])
          : [
              (await this.orderRepository.findOne({
                where: {
                  code: {
                    contains: code,
                    mode: 'insensitive',
                  },
                },
                include: {
                  payments: true,
                },
              })) as DetailedOrder,
            ];

      if (results[0] === null) {
        return [];
      }

      return results;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  //No existe relacion en Order para el paciente aparte de la metadata
  /**
   * Busca una orden por su identificador
   * @param id - Identificador de la orden
   * @returns La orden encontrada
   * @throws {BadRequestException} Si la orden no se encuentra
   */
  // async findDetailedOrderByPatientDni(dni: string): Promise<DetailedOrder[]> {
  //   try {
  //     const results = await this.orderRepository.findMany({
  //       where: {
  //         isActive: true,
  //         dni: dni
  //       },
  //       orderBy: {
  //         date: 'desc', // Changed from 'asc' to 'desc' to get newest records first
  //       },
  //       include: {
  //         payments: true,
  //       },
  //     }) as DetailedOrder[]

  //     return results;
  //   } catch (error) {
  //     this.errorHandler.handleError(error, 'getting');
  //   }
  // }

  /**
   * Crea un filtro de sucursal basado en los datos del usuario
   * @param userBranch - Datos del usuario y su sucursal
   * @returns true si no se debe aplicar ningún filtro, false si se debe filtrar
   */
  private shouldApplyBranchFilter(userBranch?: UserBranchData): boolean {
    return (
      userBranch &&
      !userBranch.isSuperAdmin &&
      userBranch.rol === 'ADMINISTRATIVO' &&
      !!userBranch.branchId
    );
  }

  /**
   * Extrae el branchId desde el campo metadata (que puede ser string o objeto)
   * @param metadata - Campo metadata de la orden
   * @returns branchId extraído o null si no se encuentra
   */
  private extractBranchIdFromMetadata(metadata: any): string | null {
    try {
      // Si es string, convertirlo a objeto
      const metadataObj =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

      // Extraer el branchId del objeto
      return metadataObj?.orderDetails?.branchId || null;
    } catch (error) {
      this.logger.warn(
        `Error al extraer branchId de metadata: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Filtra un array de órdenes según la sucursal del usuario
   * @param orders - Array de órdenes a filtrar
   * @param userBranch - Datos del usuario y sucursal
   * @returns Array de órdenes filtrado
   */
  private filterOrdersByBranch<T extends Order>(
    orders: T[],
    userBranch?: UserBranchData,
  ): T[] {
    // Si no es necesario filtrar, devolver todas las órdenes
    if (!this.shouldApplyBranchFilter(userBranch)) {
      return orders;
    }

    // Filtrar las órdenes por branchId
    return orders.filter((order) => {
      const orderBranchId = this.extractBranchIdFromMetadata(order.metadata);
      return orderBranchId === userBranch.branchId;
    });
  }

  /**
   * Obtiene todas las órdenes, filtrando por sucursal si el usuario es administrativo
   * @param userBranch - Datos del usuario y su sucursal
   * @returns Array de órdenes filtrado según permisos del usuario
   */
  async findAll(userBranch?: UserBranchData): Promise<DetailedOrder[]> {
    try {
      this.logger.log(
        `Buscando órdenes${userBranch ? ' con filtro de usuario' : ''}`,
      );

      // Obtener todas las órdenes
      const allOrders = (await this.orderRepository.findMany({
        where: {
          isActive: true,
        },
        include: {
          payments: true,
        },
        orderBy: {
          date: 'desc',
        },
      })) as DetailedOrder[];

      // Si no hay necesidad de filtrar por sucursal, devolver todas las órdenes
      if (!this.shouldApplyBranchFilter(userBranch)) {
        this.logger.log(`Retornando todas las órdenes (${allOrders.length})`);
        return allOrders;
      }

      // Filtrar órdenes por sucursal del usuario
      const filteredOrders = this.filterOrdersByBranch(allOrders, userBranch);

      this.logger.log(
        `Filtrado por sucursal: ${userBranch.branchId}. ` +
          `Total: ${filteredOrders.length} de ${allOrders.length} órdenes`,
      );

      return filteredOrders;
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
  async findByType(type: OrderType): Promise<DetailedOrder[]> {
    try {
      return this.orderRepository.findMany({
        where: { type, isActive: true },
        orderBy: {
          date: 'desc',
        },
        include: {
          payments: true,
        },
      }) as Promise<DetailedOrder[]>;
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
  async findByStatus(status: OrderStatus): Promise<DetailedOrder[]> {
    try {
      return this.orderRepository.findMany({
        where: { status, isActive: true },
        orderBy: {
          date: 'desc',
        },
        include: {
          payments: true,
        },
      }) as Promise<DetailedOrder[]>;
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
  ): Promise<DetailedOrder[]> {
    try {
      // const orders = await this.findByStatus(status);
      // return orders.filter((order) => order.type === type);
      return this.orderRepository.findMany({
        where: { type, status, isActive: true },
        orderBy: {
          date: 'desc',
        },
        include: {
          payments: true,
        },
      }) as Promise<DetailedOrder[]>;
    } catch (error) {
      return this.errorHandler.handleError(error, 'getting');
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

  /**
   * Busca órdenes por referenceId
   * @param referenceId - ID de referencia (por ejemplo, ID de una cita)
   * @returns Arreglo de órdenes con el referenceId especificado
   * @throws {BadRequestException} Si hay un error al obtener las órdenes
   */
  async findOrdersByReferenceId(referenceId: string): Promise<Order[]> {
    try {
      this.logger.debug(`Buscando órdenes con referenceId: ${referenceId}`);
      const orders = await this.orderRepository.findByReference(referenceId);
      this.logger.debug(
        `Se encontraron ${orders.length} órdenes con referenceId: ${referenceId}`,
      );
      return orders;
    } catch (error) {
      return this.errorHandler.handleError(error, 'getting');
    }
  }

  /**
   * Cancela una orden y sus pagos asociados
   * @param id - ID de la orden a cancelar
   * @param user - Datos del usuario que realiza la acción
   * @returns Respuesta con la orden cancelada
   * @throws {BadRequestException} Si hay un error al cancelar la orden
   */
  async cancelOrder(
    id: string,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      return await this.cancelOrderUseCase.execute(id, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'processing');
    }
  }

  /**
   * Reembolsa una orden y sus pagos asociados
   * @param id - ID de la orden a reembolsar
   * @param user - Datos del usuario que realiza la acción
   * @returns Respuesta con la orden reembolsada
   * @throws {BadRequestException} Si hay un error al reembolsar la orden
   */
  async refundOrder(
    id: string,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    try {
      return await this.refundOrderUseCase.execute(id, user);
    } catch (error) {
      this.errorHandler.handleError(error, 'processing');
    }
  }
}
