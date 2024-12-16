export interface IOrder {
  type: string;
  referenceId: string;
  status: string;
  details: any;
  products?: any[];
  services?: any[];
  total: number;
  date: Date;
  description?: string;
}
