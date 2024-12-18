// libs/pay/src/entities/order.entity.ts
import { IOrder } from '../interfaces/order.interface';
import { OrderStatus, OrderType } from '../interfaces/order.types';

export class Order implements IOrder {
  id: string;
  code?: string;
  type: OrderType;
  movementTypeId: string;
  referenceId: string;
  sourceId?: string;
  targetId?: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  date: Date;
  dueDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;

  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}
