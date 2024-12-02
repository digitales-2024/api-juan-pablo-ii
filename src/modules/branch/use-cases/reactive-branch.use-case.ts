import { HttpStatus, Injectable } from '@nestjs/common';
import { BranchRepository } from '../repositories/branch.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Branch } from '../entities/branch.entity';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivateBranchesUseCase {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Branch[]>> {
    // Reactivar las sucursales y registrar auditoría
    const reactivatedBranches = await this.branchRepository.transaction(
      async () => {
        const branches = await this.branchRepository.reactivateMany(ids);

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
      message: 'Sucursales reactivadas exitosamente',
      data: reactivatedBranches,
    };
  }
}
