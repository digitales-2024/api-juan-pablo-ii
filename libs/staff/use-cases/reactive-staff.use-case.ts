import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { Staff } from '../entities/staff.entity';
import { StaffRepository } from '../repositories/staff.repository';

@Injectable()
export class ReactivateStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(ids: string[], user: UserData): Promise<HttpResponse<Staff[]>> {
    // Reactivar las sucursales y registrar auditoría
    const reactivatedStaffs = await this.staffRepository.transaction(
      async () => {
        const staffs = await this.staffRepository.reactivateMany(ids);

        // Registrar auditoría para cada sucursal reactivada
        await Promise.all(
          staffs.map((branch) =>
            this.auditService.create({
              entityId: branch.id,
              entityType: 'branch',
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
      statusCode: HttpStatus.OK,
      message: 'Especializaciones reactivadas exitosamente',
      data: reactivatedStaffs,
    };
  }
}
