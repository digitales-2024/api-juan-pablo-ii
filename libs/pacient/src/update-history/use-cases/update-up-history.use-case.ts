import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUpHistoryDto } from '../dto/update-up-history.dto';
import { UpHistory } from '../entities/up-history.entity';
import { UpHistoryRepository } from '../repositories/up-history.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateUpHistoryUseCase {
  constructor(
    private readonly upHistoryRepository: UpHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateUpHistoryDto: UpdateUpHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<UpHistory>> {
    const updatedUpHistory = await this.upHistoryRepository.transaction(
      async () => {
        // Update up history
        const upHistory = await this.upHistoryRepository.update(id, {
          consultaMedicaId: updateUpHistoryDto.consultaMedicaId,
          personalId: updateUpHistoryDto.personalId,
          sucursalId: updateUpHistoryDto.sucursalId,
          historiaMedicaId: updateUpHistoryDto.historiaMedicaId,
          receta: updateUpHistoryDto.receta,
          recetaMedicaId: updateUpHistoryDto.recetaMedicaId,
          fecha: updateUpHistoryDto.fecha,
          updateHistoria: updateUpHistoryDto.updateHistoria,
          description: updateUpHistoryDto.description,
          descansoMedico: updateUpHistoryDto.descansoMedico,
          descripDescanso: updateUpHistoryDto.descripDescanso,
        });

        // Register audit
        await this.auditService.create({
          entityId: upHistory.id,
          entityType: 'updateHistoria',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return upHistory;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Actualización de historia médica actualizada exitosamente',
      data: updatedUpHistory,
    };
  }
}
