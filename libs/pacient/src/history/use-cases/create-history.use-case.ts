import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateHistoryDto } from '../dto/create-history.dto';
import { History } from '../entities/history.entity';
import { HistoryRepository } from '../repositories/history.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateHistoryUseCase {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createHistoryDto: CreateHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<History>> {
    const newHistory = await this.historyRepository.transaction(async () => {
      // Create history
      const history = await this.historyRepository.create({
        pacienteId: createHistoryDto.pacienteId,
        historiaMedica: createHistoryDto.historiaMedica,
        date: createHistoryDto.date,
        description: createHistoryDto.description,
      });

      // Register audit
      await this.auditService.create({
        entityId: history.id,
        entityType: 'historiaMedica',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return history;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Historia médica creada exitosamente',
      data: newHistory,
    };
  }
}
