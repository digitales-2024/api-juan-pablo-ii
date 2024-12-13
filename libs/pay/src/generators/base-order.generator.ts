import { IOrderGenerator, IOrder } from '../interfaces';

export abstract class BaseOrderGenerator implements IOrderGenerator {
  abstract type: string;

  canHandle(type: string): boolean {
    return this.type === type;
  }

  abstract generate(input: any): Promise<IOrder>;
  abstract calculateTotal(input: any): Promise<number>;

  protected createOrderBase(): Partial<IOrder> {
    return {
      date: new Date(),
      status: 'PENDING',
    };
  }
}
