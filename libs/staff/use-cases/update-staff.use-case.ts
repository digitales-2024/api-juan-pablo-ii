import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Injectable, BadRequestException } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { StaffRepository } from '../repositories/staff.repository';
import { Staff } from '../entities/staff.entity';
import { UpdateStaffDto } from '../dto';
import { StaffTypeRepository } from '../repositories/staff-type.repository';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Caso de uso para actualizar personal médico
 * @class
 * @description Maneja la lógica de negocio para actualizar personal médico, incluyendo validaciones y registro de auditoría
 */
@Injectable()
export class UpdateStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly staffTypeRepository: StaffTypeRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Valida si ya existe personal con el DNI proporcionado, excluyendo al personal actual
   * @param dni - Número de identificación a validar
   * @param currentStaffId - ID del personal que se está editando
   * @returns {Promise<boolean>} True si existe otro personal con el DNI, false en caso contrario
   * @private
   */
  private async validateDNIExists(dni: string, currentStaffId: string): Promise<boolean> {
    const existingStaff = await this.staffRepository.findStaffByDNI(dni);
    // Filtra para excluir al personal actual y verifica si hay otros con el mismo DNI
    return existingStaff.some(staff => staff.id !== currentStaffId);
  }

  /**
   * Ejecuta la actualización de personal médico
   * @param id - ID del personal a actualizar
   * @param updateStaffDto - DTO con los datos a actualizar
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta con el personal actualizado
   * @throws {BadRequestException} Si el tipo de personal no existe o si ya existe personal con el DNI
   */
  async execute(
    id: string,
    updateStaffDto: UpdateStaffDto,
    user: UserData,
  ): Promise<BaseApiResponse<Staff>> {
    const staffType = await this.staffTypeRepository.findById(
      updateStaffDto.staffTypeId,
    );
    if (!staffType) {
      throw new BadRequestException('El tipo de personal no existe');
    }

    // Solo validar el DNI si se está intentando actualizar
    if (updateStaffDto.dni) {
      const dniExists = await this.validateDNIExists(updateStaffDto.dni, id);
      if (dniExists) {
        throw new BadRequestException('Ya existe otro personal con este DNI');
      }
    }

    const updatedStaff = await this.staffRepository.transaction(async () => {
      const staff = await this.staffRepository.update(id, updateStaffDto);

      // Registrar auditoría
      await this.auditService.create({
        entityId: staff.id,
        entityType: 'staff',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return staff;
    });

    return {
      success: true,
      message: 'Personal actualizado exitosamente',
      data: updatedStaff,
    };
  }
}
