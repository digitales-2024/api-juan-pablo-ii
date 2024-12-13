import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { BillingService } from '../services/billing.service';
import { CreateServiceBillingDto } from '../dto/create-service-billing.dto';

@Injectable()
export class CreateServiceBillingUseCase {
  constructor(
    private readonly billingService: BillingService,
    private readonly auditService: AuditService,
  ) {}

  async execute(dto: CreateServiceBillingDto, user: UserData) {
    const order = await this.billingService.createServiceBilling(dto, user);

    // Registrar auditoría
    await this.auditService.create({
      entityId: order.id,
      entityType: 'service_billing',
      action: AuditActionType.CREATE,
      performedById: user.id,
      createdAt: new Date(),
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Orden de servicio creada exitosamente',
      data: order,
    };
  }
}
