import { Injectable } from '@nestjs/common';
import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { ServiceType } from '../entities/service.entity';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

// @Injectable()
// export class ReactivateServiceTypeUseCase {
//   constructor(
//     private readonly serviceTypeRepository: ServiceTypeRepository,
//     private readonly auditService: AuditService,
//   ) {}

//   async execute(
//     id: string,
//     user: UserData,
//   ): Promise<BaseApiResponse<ServiceType>> {
//     // Reactivar el tipo de servicio y registrar auditoría
//     const reactivatedServiceType = await this.serviceTypeRepository.transaction(
//       async () => {
//         const serviceType = await this.serviceTypeRepository.reactivate(id);

//         // Registrar auditoría
//         await this.auditService.create({
//           entityId: serviceType.id,
//           entityType: 'serviceType',
//           action: AuditActionType.UPDATE,
//           performedById: user.id,
//           createdAt: new Date(),
//         });

//         return serviceType;
//       },
//     );

//     return {
//       success: true,
//       message: 'Service type reactivated successfully',
//       data: reactivatedServiceType,
//     };
//   }
// }

@Injectable()
export class ReactivateServiceTypesUseCase {
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<ServiceType[]>> {
    // Reactivar los tipos de servicio y registrar auditoría
    const reactivatedServiceTypes =
      await this.serviceTypeRepository.transaction(async () => {
        const serviceTypes =
          await this.serviceTypeRepository.reactivateMany(ids);

        // Registrar auditoría para cada tipo de servicio reactivado
        await Promise.all(
          serviceTypes.map((serviceType) =>
            this.auditService.create({
              entityId: serviceType.id,
              entityType: 'serviceType',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return serviceTypes;
      });

    return {
      success: true,
      message: 'Service types reactivados exitosamente',
      data: reactivatedServiceTypes,
    };
  }
}
