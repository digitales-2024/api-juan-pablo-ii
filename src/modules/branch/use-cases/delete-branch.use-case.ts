import { HttpStatus, Injectable } from '@nestjs/common';
import { BranchRepository } from '../repositories/branch.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Branch } from '../entities/branch.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteBranchesDto } from '../dto/delete-branch.dto';

@Injectable()
export class DeleteBranchesUseCase {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteBranchesDto: DeleteBranchesDto,
    user: UserData,
  ): Promise<HttpResponse<Branch[]>> {
    const deletedBranches = await this.branchRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las sucursales actualizadas
        const branches = await this.branchRepository.softDeleteMany(
          deleteBranchesDto.ids,
        );

        // Registra la auditoría para cada sucursal eliminada
        await Promise.all(
          branches.map((branch) =>
            this.auditService.create({
              entityId: branch.id,
              entityType: 'branch',
              action: AuditActionType.DELETE,
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
      message: 'Sucursales eliminadas exitosamente',
      data: deletedBranches,
    };
  }
}
