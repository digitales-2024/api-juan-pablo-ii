export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}
export enum PaymentType {
  REGULAR = 'REGULAR', // Pago normal
  REFUND = 'REFUND', // Reembolso
  PARTIAL_PAYMENT = 'PARTIAL', // Pago parcial/adelanto
  ADJUSTMENT = 'ADJUSTMENT', // Ajuste contable
  COMPENSATION = 'COMPENSATION', // Descuentos/ofertas
}
