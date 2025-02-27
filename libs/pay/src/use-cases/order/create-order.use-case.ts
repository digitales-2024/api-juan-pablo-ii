import { Injectable } from '@nestjs/common';
import { Order } from '../../entities/order.entity';
import { OrderRepository } from '../../repositories/order.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { CreateOrderDto } from '@pay/pay/interfaces/dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createOrderDto: CreateOrderDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order>> {
    const newOrder = await this.orderRepository.transaction(async () => {
      // Create order
      const order = await this.orderRepository.create({
        code: createOrderDto.code,
        type: createOrderDto.type,
        movementTypeId: createOrderDto.movementTypeId,
        referenceId: createOrderDto.referenceId,
        sourceId: createOrderDto.sourceId,
        targetId: createOrderDto.targetId,
        status: createOrderDto.status,
        currency: createOrderDto.currency,
        subtotal: createOrderDto.subtotal,
        tax: createOrderDto.tax,
        total: createOrderDto.total,
        notes: createOrderDto.notes,
        metadata: createOrderDto.metadata,
      });

      // Register audit
      await this.auditService.create({
        entityId: order.id,
        entityType: 'order',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return order;
    });

    return {
      success: true,
      message: 'Orden creada exitosamente',
      data: newOrder,
    };
  }
}
