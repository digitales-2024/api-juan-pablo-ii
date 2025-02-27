import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../repositories/order.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Order } from '../../entities/order.entity';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateOrdersUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Order[]>> {
    // Reactivate orders and register audit
    const reactivatedOrders = await this.orderRepository.transaction(
      async () => {
        const orders = await this.orderRepository.reactivateMany(ids);

        // Register audit for each reactivated order
        await Promise.all(
          orders.map((order) =>
            this.auditService.create({
              entityId: order.id,
              entityType: 'order',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return orders;
      },
    );

    return {
      success: true,
      message: 'Órdenes reactivadas exitosamente',
      data: reactivatedOrders,
    };
  }
}
