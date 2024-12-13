import { Injectable, Logger } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { Order } from '../entities/order.entity';
import { IOrderGenerator } from '../interfaces';
import { UserData } from '@login/login/interfaces';

// Creamos una interfaz para el input
export interface CreateOrderInput {
  [key: string]: any; // Este es un tipo genérico para el input, podrías hacerlo más específico
  userId?: string; // Opcional: si necesitas guardar quién creó la orden
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly generators: Map<string, IOrderGenerator> = new Map();

  constructor(private readonly orderRepository: OrderRepository) {}

  registerGenerator(generator: IOrderGenerator) {
    if (generator.type && !this.generators.has(generator.type)) {
      this.generators.set(generator.type, generator);
      this.logger.log(`Generator registered for type: ${generator.type}`);
    }
  }

  async createOrder(
    type: string,
    input: CreateOrderInput,
    user: UserData,
  ): Promise<Order> {
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`Generator not found for type: ${type}`);
    }

    // Agregamos el userId al input si es necesario
    const enrichedInput = {
      ...input,
      userId: user.id,
    };

    try {
      const orderData = await generator.generate(enrichedInput);
      const order = await this.orderRepository.create({
        ...orderData,
      });

      this.logger.log(`Order created successfully with ID: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByReference(type: string, referenceId: string): Promise<Order[]> {
    try {
      return await this.orderRepository.findByReference(type, referenceId);
    } catch (error) {
      this.logger.error(
        `Error finding order by reference: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
