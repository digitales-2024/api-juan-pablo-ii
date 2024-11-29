import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData, HttpResponse } from '@login/login/interfaces';
import { Injectable, HttpStatus } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { ServiceType } from '../entities/service.entity';

@Injectable()
export class DeleteServiceTypeUseCase {
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta el caso de uso para eliminar (softdelete) un servicio.
   * @param {string} id - ID del servicio a eliminar.
   * @param {UserData} user - Datos del usuario que realiza la eliminación.
   * @returns {Promise<HttpResponse<ServiceType>>} - Respuesta HTTP con el servicio eliminado.
   */
  async execute(
    id: string,
    user: UserData,
  ): Promise<HttpResponse<ServiceType>> {
    // Realizar la eliminación lógica (softdelete) del servicio
    const deletedServiceType = await this.serviceTypeRepository.transaction(
      async () => {
        const serviceType = await this.serviceTypeRepository.delete(id);

        // Registrar auditoría
        await this.auditService.create({
          entityId: serviceType.id,
          entityType: 'service',
          action: AuditActionType.DELETE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return serviceType;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Service deleted successfully',
      data: deletedServiceType,
    };
  }
}
