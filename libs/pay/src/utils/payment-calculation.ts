import { Payment } from '../entities/payment.entity';
import { PaymentType } from '../interfaces/payment.types';

export class PaymentCalculations {
  /**
   * Calcula el monto total de pagos regulares
   */
  static calculateTotalRegularPayments(payments: Payment[]): number {
    return payments
      .filter((payment) => payment.type === PaymentType.REGULAR)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  /**
   * Calcula el monto total de reembolsos
   */
  static calculateTotalRefunds(payments: Payment[]): number {
    return Math.abs(
      payments
        .filter((payment) => payment.type === PaymentType.REFUND)
        .reduce((sum, payment) => sum + payment.amount, 0),
    );
  }

  /**
   * Calcula el monto total de descuentos aplicados
   */
  static calculateTotalDiscounts(payments: Payment[]): number {
    return Math.abs(
      payments
        .filter((payment) => payment.type === PaymentType.COMPENSATION)
        .reduce((sum, payment) => sum + payment.amount, 0),
    );
  }

  /**
   * Calcula el monto total de pagos parciales
   */
  static calculateTotalPartialPayments(payments: Payment[]): number {
    return payments
      .filter((payment) => payment.type === PaymentType.PARTIAL_PAYMENT)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  /**
   * Calcula el monto neto (incluyendo todos los tipos)
   */
  static calculateNetAmount(payments: Payment[]): number {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  /**
   * Obtiene estadísticas generales de pagos
   */
  static getPaymentStats(payments: Payment[]) {
    return {
      totalRegular: this.calculateTotalRegularPayments(payments),
      totalRefunds: this.calculateTotalRefunds(payments),
      totalDiscounts: this.calculateTotalDiscounts(payments),
      totalPartialPayments: this.calculateTotalPartialPayments(payments),
      netAmount: this.calculateNetAmount(payments),
      paymentCount: payments.length,
      refundCount: payments.filter((p) => p.type === PaymentType.REFUND).length,
      discountCount: payments.filter((p) => p.type === PaymentType.COMPENSATION)
        .length,
    };
  }
  static getPaymentStatsByType(payments: Payment[], type: PaymentType) {
    const totalKey = `total${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`;
    const countKey = `count${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`;

    return {
      [totalKey]: this.calculateTotalByType(payments, type),
      [countKey]: this.getCountByType(payments, type),
    };
  }
  /**
   * Calcula el porcentaje de reembolsos sobre pagos regulares
   */
  static calculateRefundPercentage(payments: Payment[]): number {
    const totalRegular = this.calculateTotalRegularPayments(payments);
    const totalRefunds = this.calculateTotalRefunds(payments);
    if (totalRegular === 0) return 0;
    return (totalRefunds / totalRegular) * 100;
  }

  /**
   * Calcula el porcentaje de descuentos sobre pagos regulares
   */
  static calculateDiscountPercentage(payments: Payment[]): number {
    const totalRegular = this.calculateTotalRegularPayments(payments);
    const totalDiscounts = this.calculateTotalDiscounts(payments);
    if (totalRegular === 0) return 0;
    return (totalDiscounts / totalRegular) * 100;
  }

  static calculateTotalByType(payments: Payment[], type: PaymentType): number {
    return payments
      .filter((payment) => payment.type === type)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  static getCountByType(payments: Payment[], type: PaymentType): number {
    return payments.filter((payment) => payment.type === type).length;
  }
}
