import { Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { Staff } from '../entities/staff.entity';
import { StaffRepository } from '../repositories/staff.repository';
import { DeleteStaffDto } from '../dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Caso de uso para eliminar personal médico
 * @class
 * @description Maneja la lógica de negocio para eliminar personal médico (soft delete) y registrar auditoría
 */
@Injectable()
export class DeleteStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Ejecuta la eliminación lógica de personal médico
   * @param deleteStaffDto - DTO con los IDs del personal a eliminar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta con el personal eliminado
   */
  async execute(
    deleteStaffDto: DeleteStaffDto,
    user: UserData,
  ): Promise<BaseApiResponse<Staff[]>> {
    const deletedStaffs = await this.staffRepository.transaction(async () => {
      // Realiza el soft delete y obtiene las especialidades actualizadas
      const staffs = await this.staffRepository.softDeleteMany(
        deleteStaffDto.ids,
      );

      // Registra la auditoría para cada especialidad eliminada
      await Promise.all(
        staffs.map((staff) =>
          this.auditService.create({
            entityId: staff.id,
            entityType: 'staff',
            action: AuditActionType.DELETE,
            performedById: user.id,
            createdAt: new Date(),
          }),
        ),
      );

      return staffs;
    });

    return {
      success: true,
      message: 'Personal eliminado exitosamente',
      data: deletedStaffs,
    };
  }
}
