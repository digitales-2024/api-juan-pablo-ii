import { IOrder } from '../interfaces';

export class Order implements IOrder {
  id: string;
  type: string;
  referenceId: string;
  status: string;
  details: any;
  products?: any[];
  services?: any[];
  total: number;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
