import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { OrderService } from '@pay/pay/services/order.service';
import { OrderType } from '@pay/pay/interfaces/order.types';
import { CreateMedicalConsultationBillingDto } from '../dto/create-medical-consultation-billing.dto';
import { OrderRepository } from '@pay/pay/repositories/order.repository';

@Injectable()
export class CreateMedicalConsultationOrderUseCase {
  constructor(
    private readonly auditService: AuditService,
    private readonly orderRepository: OrderRepository,
    private readonly orderService: OrderService,
  ) {}

  async execute(dto: CreateMedicalConsultationBillingDto, user: UserData) {
    const newOrder = await this.orderRepository.transaction(async () => {
      // Create order
      const order = await this.orderService.createOrder(
        OrderType.MEDICAL_CONSULTATION_ORDER,
        dto,
        user,
      );

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
      message: 'Orden de consulta médica creada exitosamente',
      data: newOrder,
    };
  }
}
