import { AuditService } from '@login/login/admin/audit/audit.service';
import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { ServiceType } from '../entities/service.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { UpdateServiceTypeDto } from '../dto';

@Injectable()
export class UpdateServiceTypeUseCase {
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateServiceTypeDto: UpdateServiceTypeDto,
    user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    // Actualizar el servicio y registrar auditoría
    const updatedServiceType = await this.serviceTypeRepository.transaction(
      async () => {
        const service = await this.serviceTypeRepository.update(
          id,
          updateServiceTypeDto,
        );

        // Registrar auditoría
        await this.auditService.create({
          entityId: service.id,
          entityType: 'serviceType',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return service;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Service updated successfully',
      data: updatedServiceType,
    };
  }
}
