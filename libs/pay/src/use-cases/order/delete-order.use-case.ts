import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../repositories/order.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Order } from '../../entities/order.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteOrdersDto } from '@pay/pay/interfaces/dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteOrdersUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteOrdersDto: DeleteOrdersDto,
    user: UserData,
  ): Promise<BaseApiResponse<Order[]>> {
    const deletedOrders = await this.orderRepository.transaction(async () => {
      // Perform soft delete and get updated orders
      const orders = await this.orderRepository.softDeleteMany(
        deleteOrdersDto.ids,
      );

      // Register audit for each deleted order
      await Promise.all(
        orders.map((order) =>
          this.auditService.create({
            entityId: order.id,
            entityType: 'order',
            action: AuditActionType.DELETE,
            performedById: user.id,
            createdAt: new Date(),
          }),
        ),
      );

      return orders;
    });

    return {
      success: true,
      message: 'Órdenes eliminadas exitosamente',
      data: deletedOrders,
    };
  }
}
