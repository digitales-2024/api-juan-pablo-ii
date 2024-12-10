import { HttpStatus, Injectable } from '@nestjs/common';
import { UpHistoryRepository } from '../repositories/up-history.repository';
import { UpHistory } from '../entities/up-history.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivateUpHistoryUseCase {
  constructor(
    private readonly upHistoryRepository: UpHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<UpHistory[]>> {
    // Reactivar las historias y registrar auditoría
    const reactivatedUpHistories = await this.upHistoryRepository.transaction(
      async () => {
        const upHistories = await this.upHistoryRepository.reactivateMany(ids);

        // Registrar auditoría para cada historia reactivada
        await Promise.all(
          upHistories.map((upHistory) =>
            this.auditService.create({
              entityId: upHistory.id,
              entityType: 'updateHistoria',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return upHistories;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Actualizaciones de historia médica reactivadas exitosamente',
      data: reactivatedUpHistories,
    };
  }
}
