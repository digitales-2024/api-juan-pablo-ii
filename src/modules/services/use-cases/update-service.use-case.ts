import { Injectable } from '@nestjs/common';
import { ServiceRepository } from '../repositories/service.repository';
import { ServiceTypeService } from '../services/service-type.service';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UpdateServiceDto } from '../dto';
import { UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateServiceDto: UpdateServiceDto,
    user: UserData,
  ): Promise<BaseApiResponse<Service>> {
    // Solo verificar el tipo de servicio si se proporciona en el DTO
    if (updateServiceDto.serviceTypeId) {
      await this.serviceTypeService.findById(updateServiceDto.serviceTypeId);
    }

    // Verificar que existe el tipo de servicio

    // Actualizar el servicio y registrar auditoría
    const updatedService = await this.serviceRepository.transaction(
      async () => {
        const service = await this.serviceRepository.update(
          id,
          updateServiceDto,
        );

        // Registrar auditoría
        await this.auditService.create({
          entityId: service.id,
          entityType: 'service',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return service;
      },
    );

    return {
      success: true,
      message: 'Service updated successfully',
      data: updatedService,
    };
  }
}
