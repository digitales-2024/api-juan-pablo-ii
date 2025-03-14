import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../../repositories/order.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Order } from '../../entities/order.entity';
import { AuditActionType } from '@prisma/client';
import { OrderStatus } from '../../interfaces/order.types';
import { PaymentStatus, PaymentType } from '../../interfaces/payment.types';
import { PaymentRepository } from '../../repositories/payment.repository';
import { SubmitDraftOrderDto } from '@pay/pay/interfaces/dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class SubmitDraftOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(
    id: string,
    submitDto: SubmitDraftOrderDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    return await this.orderRepository.transaction(async () => {
      // Validar que la orden existe y obtener datos actuales
      const order = await this.orderRepository.findById(id);
      if (!order) {
        throw new BadRequestException('Orden no encontrada');
      }

      // Validar que la orden está en estado DRAFT
      if (order.status !== OrderStatus.DRAFT) {
        throw new BadRequestException(
          'Solo se pueden confirmar órdenes en borrador',
        );
      }

      // Actualizar el estado de la orden a PENDING
      const updatedOrder = await this.orderRepository.update(id, {
        status: OrderStatus.PENDING,
        notes: submitDto.notes
          ? `${order.notes ? order.notes + ' | ' : ''}${submitDto.notes}`
          : order.notes,
      });

      // Crear el pago asociado automáticamente
      await this.paymentRepository.create({
        orderId: order.id,
        amount: order.total,
        status: PaymentStatus.PENDING,
        type: PaymentType.REGULAR,
        description: `Pago generado automáticamente para orden ${order.code}`,
        date: new Date(),
        isActive: true,
      });

      // Registrar auditoría de la actualización
      await this.auditService.create({
        entityId: order.id,
        entityType: 'order',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      // Registrar auditoría del pago creado
      await this.auditService.create({
        entityId: order.id,
        entityType: 'payment',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return {
        success: true,
        message: 'Orden confirmada exitosamente',
        data: updatedOrder,
      };
    });
  }
}
