import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData, HttpResponse } from '@login/login/interfaces';
import { Injectable, HttpStatus } from '@nestjs/common';
import { AuditActionType } from '@prisma/client';
import { StaffRepository } from '../repositories/staff.repository';
import { Staff } from '../entities/staff.entity';
import { UpdateStaffDto } from '../dto';

@Injectable()
export class UpdateStaffUseCase {
  constructor(
    private readonly personalRepository: StaffRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateStaffDto: UpdateStaffDto,
    user: UserData,
  ): Promise<HttpResponse<Staff>> {
    const updatedPersonal = await this.personalRepository.transaction(
      async () => {
        const personal = await this.personalRepository.update(
          id,
          updateStaffDto,
        );

        // Registrar auditoría
        await this.auditService.create({
          entityId: personal.id,
          entityType: 'personal',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return personal;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Personal médico actualizado exitosamente',
      data: updatedPersonal,
    };
  }
}
