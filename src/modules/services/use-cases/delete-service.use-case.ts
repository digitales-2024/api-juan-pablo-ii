import { Injectable } from '@nestjs/common';
import { ServiceRepository } from '../repositories/service.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteServicesDto } from '../dto/delete-services.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

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
  async execute(id: string, user: UserData): Promise<BaseApiResponse<Service>> {
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
      success: true,
      message: 'Service deleted successfully',
      data: deletedService,
    };
  }
}

@Injectable()
export class DeleteServicesUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteServicesDto: DeleteServicesDto,
    user: UserData,
  ): Promise<BaseApiResponse<Service[]>> {
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
      success: true,
      message: 'Servicio desactivado exitosamente',
      data: deletedServices,
    };
  }
}
