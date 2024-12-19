import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from '../interfaces/dto/create-order.dto';
import { Order } from '../entities/order.entity';
import { OrderRepository } from '../repositories/order.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createOrderDto: CreateOrderDto,
    user: UserData,
  ): Promise<HttpResponse<Order>> {
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
      statusCode: HttpStatus.CREATED,
      message: 'Orden creada exitosamente',
      data: newOrder,
    };
  }
}
