import { HttpStatus, Injectable } from '@nestjs/common';
import { HistoryRepository } from '../repositories/history.repository';
import { History } from '../entities/history.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteHistoryDto } from '../dto/delete-history.dto';

@Injectable()
export class DeleteHistoriesUseCase {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteHistoriesDto: DeleteHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<History[]>> {
    const deletedHistories = await this.historyRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las historias actualizadas
        const histories = await this.historyRepository.softDeleteMany(
          deleteHistoriesDto.ids,
        );

        // Registra la auditoría para cada historia eliminada
        await Promise.all(
          histories.map((history) =>
            this.auditService.create({
              entityId: history.id,
              entityType: 'historiaMedica',
              action: AuditActionType.DELETE,
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
      message: 'Historias médicas eliminadas exitosamente',
      data: deletedHistories,
    };
  }
}
