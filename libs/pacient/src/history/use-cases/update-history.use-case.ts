import { HttpStatus, Injectable } from '@nestjs/common';

import { History } from '../entities/history.entity';
import { HistoryRepository } from '../repositories/history.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { UpdateHistoryDto } from '../dto';

@Injectable()
export class UpdateHistoryUseCase {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateHistoryDto: UpdateHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<History>> {
    const updatedHistory = await this.historyRepository.transaction(
      async () => {
        // Update history
        const history = await this.historyRepository.update(id, {
          pacienteId: updateHistoryDto.pacienteId,
          historiaMedica: updateHistoryDto.historiaMedica,
          date: updateHistoryDto.date,
          description: updateHistoryDto.description,
        });

        // Register audit
        await this.auditService.create({
          entityId: history.id,
          entityType: 'historiaMedica',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return history;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Historia médica actualizada exitosamente',
      data: updatedHistory,
    };
  }
}
