import { OrderStatus, OrderType } from './order.types';

export interface IOrder {
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
}

// Base para generadores de órdenes
export interface IOrderGenerator {
  type: OrderType;
  canHandle(type: OrderType): boolean;
  generate(input: any): Promise<IOrder>;
  calculateTotal(input: any): Promise<number>;
  calculateTax(subtotal: number): Promise<number>;
}
