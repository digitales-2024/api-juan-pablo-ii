import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData, HttpResponse } from '@login/login/interfaces';
import { Injectable, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { StaffRepository } from '../repositories/staff.repository';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto } from '../dto';
import { SpecializationRepository } from '../repositories/specialization.repository';

@Injectable()
export class CreateStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly auditService: AuditService,
    private readonly specializationRepository: SpecializationRepository,
  ) {}

  private async validateDNIExists(dni: string): Promise<boolean> {
    const existingStaff = await this.staffRepository.findStaffByDNI(dni);
    // Devuelve true si hay pacientes con el DNI proporcionado, false si no
    return existingStaff.length > 0;
  }

  async execute(
    createStaffDto: CreateStaffDto,
    user: UserData,
  ): Promise<HttpResponse<Staff>> {
    const especialidad = await this.specializationRepository.findById(
      createStaffDto.especialidadId,
    );
    if (!especialidad) {
      throw new BadRequestException('La especialidad no existe');
    }

    const dniExists = await this.validateDNIExists(createStaffDto.dni);
    if (dniExists) {
      throw new BadRequestException('Ya existe personal con este DNI');
    }

    const newPersonal = await this.staffRepository.transaction(async () => {
      const personal = await this.staffRepository.createPersonal({
        name: createStaffDto.name,
        lastName: createStaffDto.lastName,
        dni: createStaffDto.dni,
        birth: createStaffDto.birth,
        email: createStaffDto.email,
        phone: createStaffDto.phone,
        userId: createStaffDto.userId,
        especialidadId: createStaffDto.especialidadId,
      });

      await this.auditService.create({
        entityId: personal.id,
        entityType: 'personal',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return personal;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Personal médico creado exitosamente',
      data: newPersonal,
    };
  }
}
