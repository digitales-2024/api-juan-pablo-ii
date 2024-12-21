import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../repositories/order.repository';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../interfaces/order.types';

@Injectable()
export class FindOrdersByStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(status: OrderStatus): Promise<Order[]> {
    return this.orderRepository.findMany({
      where: {
        status,
        isActive: true,
      },
      include: {
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
