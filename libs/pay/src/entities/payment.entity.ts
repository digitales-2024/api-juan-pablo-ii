export class Payment {
  id: string;
  orderId: string;
  amount: number;
  date: Date;
  status: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
