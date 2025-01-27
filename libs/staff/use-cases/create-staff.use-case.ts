import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Injectable, BadRequestException } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { StaffRepository } from '../repositories/staff.repository';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto } from '../dto';
import { StaffTypeRepository } from '../repositories/staff-type.repository';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

/**
 * Caso de uso para crear nuevo personal médico
 * @class
 * @description Maneja la lógica de negocio para crear personal médico, incluyendo validaciones y registro de auditoría
 */
@Injectable()
export class CreateStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly auditService: AuditService,
    private readonly staffTypeRepository: StaffTypeRepository,
  ) {}

  /**
   * Valida si ya existe personal con el DNI proporcionado
   * @param dni - Número de identificación a validar
   * @returns {Promise<boolean>} True si existe personal con el DNI, false en caso contrario
   * @private
   */
  private async validateDNIExists(dni: string): Promise<boolean> {
    const existingStaff = await this.staffRepository.findStaffByDNI(dni);
    // Devuelve true si hay pacientes con el DNI proporcionado, false si no
    return existingStaff.length > 0;
  }

  /**
   * Ejecuta la creación de personal médico
   * @param createStaffDto - DTO con los datos del personal a crear
   * @param user - Datos del usuario que realiza la operación
   * @returns Respuesta con el personal creado
   * @throws {BadRequestException} Si el tipo de personal no existe o si ya existe personal con el DNI
   */
  async execute(
    createStaffDto: CreateStaffDto,
    user: UserData,
  ): Promise<BaseApiResponse<Staff>> {
    const staffType = await this.staffTypeRepository.findById(
      createStaffDto.staffTypeId,
    );
    if (!staffType) {
      throw new BadRequestException('El tipo de personal no existe');
    }

    const dniExists = await this.validateDNIExists(createStaffDto.dni);
    if (dniExists) {
      throw new BadRequestException('Ya existe personal con este DNI');
    }

    const newStaff = await this.staffRepository.transaction(async () => {
      const staff = await this.staffRepository.createPersonal({
        name: createStaffDto.name,
        lastName: createStaffDto.lastName,
        dni: createStaffDto.dni,
        birth: createStaffDto.birth,
        email: createStaffDto.email,
        phone: createStaffDto.phone,
        userId: createStaffDto.userId,
        staffTypeId: createStaffDto.staffTypeId,
      });

      await this.auditService.create({
        entityId: staff.id,
        entityType: 'staff',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return staff;
    });

    return {
      success: true,
      message: 'Personal creado exitosamente',
      data: newStaff,
    };
  }
}
