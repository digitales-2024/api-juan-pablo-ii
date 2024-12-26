export enum OrderEvents {
  ORDER_COMPLETED = 'order.completed',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_FAILED = 'order.failed',
  ORDER_REQUIRES_ATTENTION = 'order.requires_attention',
}

export interface OrderEventPayload {
  order: any;
  metadata?: Record<string, any>;
}

export interface OrderFailedEventPayload {
  orderId: string;
  error: string;
  metadata?: Record<string, any>;
}
