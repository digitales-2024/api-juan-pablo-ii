import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { Staff } from '../entities/staff.entity';
import { StaffRepository } from '../repositories/staff.repository';
import { DeleteStaffDto } from '../dto';

@Injectable()
export class DeleteStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteStaffDto: DeleteStaffDto,
    user: UserData,
  ): Promise<HttpResponse<Staff[]>> {
    const deletedStaffs = await this.staffRepository.transaction(async () => {
      // Realiza el soft delete y obtiene las especialidades actualizadas
      const staffs = await this.staffRepository.softDeleteMany(
        deleteStaffDto.ids,
      );

      // Registra la auditoría para cada especialidad eliminada
      await Promise.all(
        staffs.map((specialization) =>
          this.auditService.create({
            entityId: specialization.id,
            entityType: 'especialidad',
            action: AuditActionType.DELETE,
            performedById: user.id,
            createdAt: new Date(),
          }),
        ),
      );

      return staffs;
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Personal eliminado exitosamente',
      data: deletedStaffs,
    };
  }
}
