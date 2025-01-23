import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Injectable } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { ServiceTypeRepository } from '../repositories/service-type.repository';
import { ServiceType } from '../entities/service.entity';
import { DeleteServiceTypesDto } from '../dto/delete-service-types.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

// @Injectable()
// export class DeleteServiceTypeUseCase {
//   constructor(
//     private readonly serviceTypeRepository: ServiceTypeRepository,
//     private readonly auditService: AuditService,
//   ) {}

//   /**
//    * Ejecuta el caso de uso para eliminar (softdelete) un servicio.
//    * @param {string} id - ID del servicio a eliminar.
//    * @param {UserData} user - Datos del usuario que realiza la eliminación.
//    * @returns {Promise<HttpResponse<ServiceType>>} - Respuesta HTTP con el servicio eliminado.
//    */
//   async execute(
//     id: string,
//     user: UserData,
//   ): Promise<BaseApiResponse<ServiceType>> {
//     // Realizar la eliminación lógica (softdelete) del servicio
//     const deletedServiceType = await this.serviceTypeRepository.transaction(
//       async () => {
//         const serviceType = await this.serviceTypeRepository.softDelete(id);

//         // Registrar auditoría
//         await this.auditService.create({
//           entityId: serviceType.id,
//           entityType: 'serviceType',
//           action: AuditActionType.DELETE,
//           performedById: user.id,
//           createdAt: new Date(),
//         });

//         return serviceType;
//       },
//     );

//     return {
//       success: true,
//       message: 'ServiceType desactivado existosamente',
//       data: deletedServiceType,
//     };
//   }
// }

@Injectable()
export class DeleteServiceTypesUseCase {
  constructor(
    private readonly serviceTypeRepository: ServiceTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteServiceTypesDto: DeleteServiceTypesDto,
    user: UserData,
  ): Promise<BaseApiResponse<ServiceType[]>> {
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
              entityType: 'serviceType',
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
      success: true,
      message: 'Services deleted successfully',
      data: deletedServiceTypes,
    };
  }
}
