import { HttpStatus, Injectable } from '@nestjs/common';
import { UpHistoryRepository } from '../repositories/up-history.repository';
import { UpHistory } from '../entities/up-history.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteUpHistoryDto } from '../dto/delete-up-history.dto';

@Injectable()
export class DeleteUpHistoriesUseCase {
  constructor(
    private readonly upHistoryRepository: UpHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteUpHistoriesDto: DeleteUpHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<UpHistory[]>> {
    const deletedUpHistories = await this.upHistoryRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las historias actualizadas
        const upHistories = await this.upHistoryRepository.softDeleteMany(
          deleteUpHistoriesDto.ids,
        );

        // Registra la auditoría para cada historia eliminada
        await Promise.all(
          upHistories.map((upHistory) =>
            this.auditService.create({
              entityId: upHistory.id,
              entityType: 'updateHistoria',
              action: AuditActionType.DELETE,
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
      message: 'Actualizaciones de historia médica eliminadas exitosamente',
      data: deletedUpHistories,
    };
  }
}
