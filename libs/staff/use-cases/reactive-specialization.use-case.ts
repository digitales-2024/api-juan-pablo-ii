import { HttpStatus, Injectable } from '@nestjs/common';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditActionType } from '@prisma/client';
import { SpecializationRepository } from '../repositories/specialization.repository';
import { Specialization } from '../entities/staff.entity';

@Injectable()
export class ReactivateSpecializationUseCase {
  constructor(
    private readonly specializationRepository: SpecializationRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Specialization[]>> {
    // Reactivar las sucursales y registrar auditoría
    const reactivatedBranches = await this.specializationRepository.transaction(
      async () => {
        const branches =
          await this.specializationRepository.reactivateMany(ids);

        // Registrar auditoría para cada sucursal reactivada
        await Promise.all(
          branches.map((branch) =>
            this.auditService.create({
              entityId: branch.id,
              entityType: 'branch',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return branches;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Especializaciones reactivadas exitosamente',
      data: reactivatedBranches,
    };
  }
}
