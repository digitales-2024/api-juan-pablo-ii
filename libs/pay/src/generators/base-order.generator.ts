import { IOrder, IOrderGenerator } from '../interfaces';
import { OrderStatus, OrderType } from '../interfaces/order.types';

export abstract class BaseOrderGenerator implements IOrderGenerator {
  abstract type: OrderType;
  protected readonly TAX_RATE = 0.18; // 18% IGV

  canHandle(type: string): boolean {
    return this.type === type;
  }

  abstract generate(input: any): Promise<IOrder>;
  abstract calculateTotal(input: any): Promise<number>;

  async calculateTax(subtotal: number): Promise<number> {
    return subtotal * this.TAX_RATE;
  }

  protected createOrderBase(): Partial<IOrder> {
    return {
      date: new Date(),
      status: OrderStatus.PENDING,
      currency: 'PEN', // Default moneda
    };
  }

  protected async calculateTotals(subtotal: number): Promise<{
    subtotal: number;
    tax: number;
    total: number;
  }> {
    const tax = await this.calculateTax(subtotal);
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }

  protected generateCode(prefix: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }
}
