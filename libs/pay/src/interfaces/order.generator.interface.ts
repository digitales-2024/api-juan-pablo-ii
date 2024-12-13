import { IOrder } from './order.interface';

export interface IOrderGenerator {
  type: string;
  canHandle(type: string): boolean;
  generate(input: any): Promise<IOrder>;
  calculateTotal(input: any): Promise<number>;
}
