import { Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { StaffTypeRepository } from '../repositories/staff-type.repository';
import { StaffType } from '../entities/staff.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Caso de uso para reactivar tipos de personal
 * @class
 * @description Maneja la lógica de negocio para reactivar tipos de personal previamente eliminados y registrar auditoría
 */
@Injectable()
export class ReactivateStaffTypeUseCase {
  constructor(
    private readonly StaffTypeRepository: StaffTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta la reactivación de tipos de personal
   * @param ids - Array de IDs de los tipos de personal a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta con los tipos de personal reactivados
   */
  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<StaffType[]>> {
    // Reactivar las sucursales y registrar auditoría
    const reactivatedStaffType =
      await this.StaffTypeRepository.transaction(async () => {
        const staffType =
          await this.StaffTypeRepository.reactivateMany(ids);

        // Registrar auditoría para cada sucursal reactivada
        await Promise.all(
          staffType.map((staffType) =>
            this.auditService.create({
              entityId: staffType.id,
              entityType: 'staffType',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return staffType;
      });

    return {
      success: true,
      message: 'Tipos de personal reactivados exitosamente',
      data: reactivatedStaffType,
    };
  }
}
