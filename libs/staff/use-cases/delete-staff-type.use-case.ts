import { Injectable } from '@nestjs/common';
import { StaffTypeRepository } from '../repositories/staff-type.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { DeleteStaffTypeDto } from '../dto';
import { StaffType } from '../entities/staff.entity';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Caso de uso para eliminar tipos de personal
 * @class
 * @description Maneja la lógica de negocio para eliminar tipos de personal (soft delete) y registrar auditoría
 */
@Injectable()
export class DeleteStaffTypeUseCase {
  constructor(
    private readonly StaffTypeRepository: StaffTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta la eliminación lógica de tipos de personal
   * @param DeleteStaffTypeDto - DTO con los IDs de los tipos de personal a eliminar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta con los tipos de personal eliminados
   */
  async execute(
    DeleteStaffTypeDto: DeleteStaffTypeDto,
    user: UserData,
  ): Promise<BaseApiResponse<StaffType[]>> {
    const deletedStaffTypes =
      await this.StaffTypeRepository.transaction(async () => {
        // Realiza el soft delete y obtiene las especialidades actualizadas
        const staffTypes =
          await this.StaffTypeRepository.softDeleteMany(
            DeleteStaffTypeDto.ids,
          );

        // Registra la auditoría para cada especialidad eliminada
        await Promise.all(
          staffTypes.map((staffType) =>
            this.auditService.create({
              entityId: staffType.id,
              entityType: 'staffType',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return staffTypes;
      });

    return {
      success: true,
      message: 'Tipos de personal eliminados exitosamente',
      data: deletedStaffTypes,
    };
  }
}
