import { Injectable } from '@nestjs/common';
import { ServiceRepository } from '../repositories/service.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
@Injectable()
export class ReactivateServicesUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Service[]>> {
    // Reactivar los servicios y registrar auditoría
    const reactivatedServices = await this.serviceRepository.transaction(
      async () => {
        const services = await this.serviceRepository.reactivateMany(ids);

        // Registrar auditoría para cada servicio reactivado
        await Promise.all(
          services.map((service) =>
            this.auditService.create({
              entityId: service.id,
              entityType: 'service',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return services;
      },
    );

    return {
      success: true,
      message: 'Services reactivated successfully',
      data: reactivatedServices,
    };
  }
}
