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
