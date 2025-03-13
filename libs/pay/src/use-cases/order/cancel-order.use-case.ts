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
export class CancelOrderUseCase {
    private readonly logger = new Logger(CancelOrderUseCase.name);

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly paymentRepository: PaymentRepository,
        private readonly auditService: AuditService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(id: string, user: UserData): Promise<BaseApiResponse<Order>> {
        try {
            this.logger.debug(`Cancelando orden con ID: ${id}`);

            // Buscar la orden
            const order = await this.orderRepository.findById(id);
            if (!order) {
                throw new BadRequestException(`Orden con ID ${id} no encontrada`);
            }

            // Verificar que la orden no esté ya cancelada
            if (order.status === OrderStatus.CANCELLED) {
                this.logger.debug(`La orden ${id} ya está cancelada`);
                return {
                    success: true,
                    message: 'La orden ya está cancelada',
                    data: order,
                };
            }

            // Usar transacción para actualizar la orden y los pagos
            const updatedOrder = await this.orderRepository.transaction(async () => {
                // Actualizar el estado de la orden a CANCELLED
                const updatedOrder = await this.orderRepository.update(id, {
                    status: OrderStatus.CANCELLED,
                });

                // Buscar y cancelar todos los pagos asociados a la orden
                const payments = await this.paymentRepository.findMany({
                    where: { orderId: id }
                });

                if (payments && payments.length > 0) {
                    for (const payment of payments) {
                        // Solo cancelar pagos que estén en estado PENDING o PROCESSING
                        if (payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.PROCESSING) {
                            await this.paymentRepository.update(payment.id, {
                                status: PaymentStatus.CANCELLED,
                            });
                            this.logger.debug(`Pago ${payment.id} actualizado a estado CANCELLED`);
                        }
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

            // Emitir evento de orden cancelada
            this.eventEmitter.emit(OrderEvents.ORDER_CANCELLED, {
                order: updatedOrder
            });

            return {
                success: true,
                message: 'Orden y pagos asociados cancelados exitosamente',
                data: updatedOrder,
            };
        } catch (error) {
            this.logger.error(`Error al cancelar la orden ${id}:`, error.message);
            this.eventEmitter.emit(OrderEvents.ORDER_FAILED, {
                orderId: id,
                error: error.message,
            });
            throw error;
        }
    }
} 