import { HttpStatus, Injectable } from '@nestjs/common';
import { HistoryRepository } from '../repositories/history.repository';
import { History } from '../entities/history.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivateHistoryUseCase {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<History[]>> {
    // Reactivar las historias y registrar auditoría
    const reactivatedHistories = await this.historyRepository.transaction(
      async () => {
        const histories = await this.historyRepository.reactivateMany(ids);

        // Registrar auditoría para cada historia reactivada
        await Promise.all(
          histories.map((history) =>
            this.auditService.create({
              entityId: history.id,
              entityType: 'historiaMedica',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return histories;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Historias médicas reactivadas exitosamente',
      data: reactivatedHistories,
    };
  }
}
