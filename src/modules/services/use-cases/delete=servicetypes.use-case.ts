import { AuditService } from '@login/login/admin/audit/audit.service';
import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { DeleteServiceTypesDto } from '../dto/delete-services-type.dto';
import { UserData, HttpResponse } from '@login/login/interfaces';
import { Injectable, HttpStatus } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { ServiceType } from '../entities/service.entity';

@Injectable()
export class DeleteServiceTypesUseCase {
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteServiceTypesDto: DeleteServiceTypesDto,
    user: UserData,
  ): Promise<HttpResponse<ServiceType[]>> {
    const deletedServiceTypes = await this.serviceTypeRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los servicios actualizados
        const serviceTypes = await this.serviceTypeRepository.softDeleteMany(
          deleteServiceTypesDto.ids,
        );

        // Registra la auditoría para cada servicio eliminado
        await Promise.all(
          serviceTypes.map((service) =>
            this.auditService.create({
              entityId: service.id,
              entityType: 'service',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return serviceTypes;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Services deleted successfully',
      data: deletedServiceTypes,
    };
  }
}
