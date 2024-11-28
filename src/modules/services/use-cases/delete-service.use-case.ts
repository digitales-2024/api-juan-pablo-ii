import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceRepository } from '../repositories/service.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class DeleteServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta el caso de uso para eliminar (softdelete) un servicio.
   * @param {string} id - ID del servicio a eliminar.
   * @param {UserData} user - Datos del usuario que realiza la eliminación.
   * @returns {Promise<HttpResponse<Service>>} - Respuesta HTTP con el servicio eliminado.
   */
  async execute(id: string, user: UserData): Promise<HttpResponse<Service>> {
    // Realizar la eliminación lógica (softdelete) del servicio
    const deletedService = await this.serviceRepository.transaction(
      async () => {
        const service = await this.serviceRepository.softDelete(id);

        // Registrar auditoría
        await this.auditService.create({
          entityId: service.id,
          entityType: 'service',
          action: AuditActionType.DELETE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return service;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Service deleted successfully',
      data: deletedService,
    };
  }
}
