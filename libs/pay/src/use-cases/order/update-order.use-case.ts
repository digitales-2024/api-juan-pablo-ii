import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateOrderDto } from '../../interfaces/dto/update-order.dto';
import { Order } from '../../entities/order.entity';
import { OrderRepository } from '../../repositories/order.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateOrderDto: UpdateOrderDto,
    user: UserData,
  ): Promise<HttpResponse<Order>> {
    const updatedOrder = await this.orderRepository.transaction(async () => {
      // Update order
      const order = await this.orderRepository.update(id, {
        ...updateOrderDto,
        // Add any specific mapping if needed
      });

      // Register audit
      await this.auditService.create({
        entityId: order.id,
        entityType: 'order',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return order;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Orden actualizada exitosamente',
      data: updatedOrder,
    };
  }
}
