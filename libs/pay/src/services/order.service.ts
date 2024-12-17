import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { Order } from '../entities/order.entity';
import { IOrderGenerator } from '../interfaces';
import { UserData } from '@login/login/interfaces';
import { BaseErrorHandler } from 'src/common/error-handlers/service-error.handler';
import { orderErrorMessages } from '../errors/errors-order';

// Creamos una interfaz para el input
export interface CreateOrderInput {
  [key: string]: any;
  userId?: string;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly generators: Map<string, IOrderGenerator> = new Map();
  private readonly errorHandler: BaseErrorHandler;

  constructor(private readonly orderRepository: OrderRepository) {
    this.errorHandler = new BaseErrorHandler(
      this.logger,
      'Order',
      orderErrorMessages,
    );
  }

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

  async createOrder(
    type: string,
    input: CreateOrderInput,
    user: UserData,
  ): Promise<Order> {
    try {
      const generator = this.generators.get(type);
      if (!generator) {
        throw new BadRequestException(
          `No se encontró un generador para el tipo: ${type}`,
        );
      }

      const enrichedInput = {
        ...input,
        userId: user.id,
      };

      const orderData = await generator.generate(enrichedInput);
      const order = await this.orderRepository.create({
        ...orderData,
      });

      this.logger.log(`Order created successfully with ID: ${order.id}`);
      return order;
    } catch (error) {
      this.errorHandler.handleError(error, 'creating');
    }
  }

  async findOrderById(id: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        throw new BadRequestException('Orden no encontrada');
      }
      return order;
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      return await this.orderRepository.findMany();
    } catch (error) {
      this.errorHandler.handleError(error, 'getting');
    }
  }
}
