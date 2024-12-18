import { ErrorMessages } from 'src/common/error-handlers/service-error.handler';

export const billingErrorMessages: ErrorMessages = {
  notFound: 'Order not found',
  alreadyExists: 'Order already exists',
  invalidData: 'Invalid order data',
  notActive: 'Order is not active',
  alreadyActive: 'Order is already active',
  inUse: 'Order is in use',
  invalidOperation: 'Invalid operation for this order',
  invalidType: 'Invalid order type',
  invalidStatus: 'Invalid order status',
  typeNotImplemented: 'Order type not implemented',
};
