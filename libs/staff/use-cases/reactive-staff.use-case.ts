import { Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { Staff } from '../entities/staff.entity';
import { StaffRepository } from '../repositories/staff.repository';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Caso de uso para reactivar personal médico
 * @class
 * @description Maneja la lógica de negocio para reactivar personal médico previamente eliminado y registrar auditoría
 */
@Injectable()
export class ReactivateStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta la reactivación de personal médico
   * @param ids - Array de IDs del personal a reactivar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta con el personal reactivado
   */
  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Staff[]>> {
    // Reactivar las sucursales y registrar auditoría
    const reactivatedStaffs = await this.staffRepository.transaction(
      async () => {
        const staffs = await this.staffRepository.reactivateMany(ids);

        // Registrar auditoría para cada sucursal reactivada
        await Promise.all(
          staffs.map((staff) =>
            this.auditService.create({
              entityId: staff.id,
              entityType: 'staff',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return staffs;
      },
    );

    return {
      success: true,
      message: 'Personal reactivado exitosamente',
      data: reactivatedStaffs,
    };
  }
}
