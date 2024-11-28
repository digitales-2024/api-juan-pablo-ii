import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceRepository } from '../repositories/service.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteServicesDto } from '../dto/delete-services.dto';
@Injectable()
export class DeleteServicesUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteServicesDto: DeleteServicesDto,
    user: UserData,
  ): Promise<HttpResponse<Service[]>> {
    const deletedServices = await this.serviceRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los servicios actualizados
        const services = await this.serviceRepository.softDeleteMany(
          deleteServicesDto.ids,
        );

        // Registra la auditoría para cada servicio eliminado
        await Promise.all(
          services.map((service) =>
            this.auditService.create({
              entityId: service.id,
              entityType: 'service',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return services;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Services deleted successfully',
      data: deletedServices,
    };
  }
}
