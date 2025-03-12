import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderEvents } from '../../events/order.events';
import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { PaymentRepository } from '@pay/pay/repositories/payment.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Order } from '@pay/pay/entities/order.entity';
import { OrderStatus } from '@pay/pay/interfaces/order.types';
import { PaymentStatus } from '@pay/pay/interfaces/payment.types';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class RefundOrderUseCase {
    private readonly logger = new Logger(RefundOrderUseCase.name);

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly paymentRepository: PaymentRepository,
        private readonly auditService: AuditService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(id: string, user: UserData): Promise<BaseApiResponse<Order>> {
        try {
            this.logger.debug(`Reembolsando orden con ID: ${id}`);

            // Buscar la orden
            const order = await this.orderRepository.findById(id);
            if (!order) {
                throw new BadRequestException(`Orden con ID ${id} no encontrada`);
            }

            // Verificar que la orden esté completada
            if (order.status !== OrderStatus.COMPLETED) {
                // Si no está completada, verificar si ya está reembolsada
                if (order.status === OrderStatus.REFUNDED) {
                    this.logger.debug(`La orden ${id} ya está reembolsada`);
                    return {
                        success: true,
                        message: 'La orden ya está reembolsada',
                        data: order,
                    };
                }

                // Si no está ni completada ni reembolsada, lanzar error
                throw new BadRequestException(
                    `Solo se pueden reembolsar órdenes completadas. Estado actual: ${order.status}`,
                );
            }

            // Buscar pagos asociados a la orden
            const payments = await this.paymentRepository.findMany({
                where: { orderId: id }
            });

            // Verificar que existan pagos completados
            const hasCompletedPayments = payments.some(
                payment => payment.status === PaymentStatus.COMPLETED
            );

            if (!hasCompletedPayments) {
                throw new BadRequestException(
                    'No se encontraron pagos completados asociados a esta orden',
                );
            }

            // Usar transacción para actualizar la orden y los pagos
            const updatedOrder = await this.orderRepository.transaction(async () => {
                // Actualizar el estado de la orden a REFUNDED
                const updatedOrder = await this.orderRepository.update(id, {
                    status: OrderStatus.REFUNDED,
                });

                // Actualizar todos los pagos completados a REFUNDED
                for (const payment of payments) {
                    if (payment.status === PaymentStatus.COMPLETED) {
                        await this.paymentRepository.update(payment.id, {
                            status: PaymentStatus.REFUNDED,
                        });
                        this.logger.debug(`Pago ${payment.id} actualizado a estado REFUNDED`);
                    }
                }

                // Registrar la acción en la auditoría
                await this.auditService.create({
                    entityId: id,
                    entityType: 'order',
                    action: AuditActionType.UPDATE,
                    performedById: user.id,
                    createdAt: new Date(),
                });

                return updatedOrder;
            });

            // Emitir evento de orden reembolsada (usando el evento genérico ORDER_CANCELLED por ahora)
            // Podría crearse un evento específico para reembolsos en el futuro
            this.eventEmitter.emit(OrderEvents.ORDER_CANCELLED, {
                order: updatedOrder,
                metadata: { refunded: true }
            });

            return {
                success: true,
                message: 'Orden y pagos asociados reembolsados exitosamente',
                data: updatedOrder,
            };
        } catch (error) {
            this.logger.error(`Error al reembolsar la orden ${id}:`, error.message);
            this.eventEmitter.emit(OrderEvents.ORDER_FAILED, {
                orderId: id,
                error: error.message,
            });
            throw error;
        }
    }
} 