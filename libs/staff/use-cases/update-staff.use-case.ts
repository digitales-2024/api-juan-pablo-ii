import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData, HttpResponse } from '@login/login/interfaces';
import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { StaffRepository } from '../repositories/staff.repository';
import { Staff } from '../entities/staff.entity';
import { UpdateStaffDto } from '../dto';
import { SpecializationRepository } from '../repositories/specialization.repository';

@Injectable()
export class UpdateStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly specializationRepository: SpecializationRepository,
    private readonly auditService: AuditService,
  ) {}

  private async validateDNIExists(dni: string): Promise<boolean> {
    const existingStaff = await this.staffRepository.findStaffByDNI(dni);
    // Devuelve true si hay pacientes con el DNI proporcionado, false si no
    return existingStaff.length > 0;
  }

  async execute(
    id: string,
    updateStaffDto: UpdateStaffDto,
    user: UserData,
  ): Promise<HttpResponse<Staff>> {
    const especialidad = await this.specializationRepository.findById(
      updateStaffDto.especialidadId,
    );
    if (!especialidad) {
      throw new BadRequestException('La especialidad no existe');
    }

    const dniExists = await this.validateDNIExists(updateStaffDto.dni);
    if (dniExists) {
      throw new BadRequestException('Ya existe personal con este DNI');
    }

    const updatedPersonal = await this.staffRepository.transaction(async () => {
      const personal = await this.staffRepository.update(id, updateStaffDto);

      // Registrar auditoría
      await this.auditService.create({
        entityId: personal.id,
        entityType: 'personal',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return personal;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Personal médico actualizado exitosamente',
      data: updatedPersonal,
    };
  }
}
