export class Payment {
  id: string;
  orderId: string;
  amount: number;
  date: Date;
  status: string;
  description?: string;
  referenceCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
