import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma';
import { Order } from '../entities/order.entity';
import { PayBaseRepository } from './base.repositoriy';

@Injectable()
export class OrderRepository extends PayBaseRepository<Order> {
  constructor(prisma: PrismaService) {
    super(prisma, 'order');
  }
}
