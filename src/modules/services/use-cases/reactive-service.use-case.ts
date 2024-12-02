import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceRepository } from '../repositories/service.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Service } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';

// @Injectable()
// export class ReactivateServiceUseCase {
//   constructor(
//     private readonly serviceRepository: ServiceRepository,
//     private readonly auditService: AuditService,
//   ) {}
//
//   async execute(id: string, user: UserData): Promise<HttpResponse<Service>> {
//     // Reactivar el servicio y registrar auditoría
//     const reactivatedService = await this.serviceRepository.transaction(
//       async () => {
//         const service = await this.serviceRepository.reactivate(id);
//
//         // Registrar auditoría
//         await this.auditService.create({
//           entityId: service.id,
//           entityType: 'service',
//           action: AuditActionType.UPDATE,
//           performedById: user.id,
//           createdAt: new Date(),
//         });
//
//         return service;
//       },
//     );
//
//     return {
//       statusCode: HttpStatus.OK,
//       message: 'Service reactivated successfully',
//       data: reactivatedService,
//     };
//   }
// }

@Injectable()
export class ReactivateServicesUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Service[]>> {
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
      statusCode: HttpStatus.OK,
      message: 'Services reactivated successfully',
      data: reactivatedServices,
    };
  }
}
