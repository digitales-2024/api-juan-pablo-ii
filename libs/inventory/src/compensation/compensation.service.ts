// import { OrderRepository } from '@pay/pay/repositories/order.repository';
import { TypeMovementRepository } from '../type-movement/repositories/type-movement.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { Order } from '@pay/pay/entities/order.entity';
// import { OrderStatus } from '@pay/pay/interfaces/order.types';
// import { AuditActionType } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompensationService {
  constructor(
    private readonly typeMovementRepository: TypeMovementRepository,
    // private readonly orderRepository: OrderRepository,
    private readonly auditRepository: AuditService,
  ) {}

  async compensateFailedMovements(order: Order) {
    return this.typeMovementRepository.transaction(async () => {
      await this.typeMovementRepository.update(order.movementTypeId, {
        state: false,
      });

      // await this.auditRepository.create({
      //   entityId: order.id,
      //   entityType: 'movementType',
      //   action: AuditActionType.UPDATE,
      //   performedById: 'system',
      //   createdAt: new Date(),
      // });
    });
  }
}
