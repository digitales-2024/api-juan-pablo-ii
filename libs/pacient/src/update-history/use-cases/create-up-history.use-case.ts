import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUpHistoryDto } from '../dto/create-up-history.dto';
import { UpHistory } from '../entities/up-history.entity';
import { UpHistoryRepository } from '../repositories/up-history.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateUpHistoryUseCase {
  constructor(
    private readonly upHistoryRepository: UpHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createUpHistoryDto: CreateUpHistoryDto,
    user: UserData,
  ): Promise<HttpResponse<UpHistory>> {
    const newUpHistory = await this.upHistoryRepository.transaction(
      async () => {
        // Create up history
        const upHistory = await this.upHistoryRepository.create({
          consultaMedicaId: createUpHistoryDto.consultaMedicaId,
          personalId: createUpHistoryDto.personalId,
          sucursalId: createUpHistoryDto.sucursalId,
          historiaMedicaId: createUpHistoryDto.historiaMedicaId,
          receta: createUpHistoryDto.receta,
          recetaMedicaId: createUpHistoryDto.recetaMedicaId,
          fecha: createUpHistoryDto.fecha,
          updateHistoria: createUpHistoryDto.updateHistoria,
          description: createUpHistoryDto.description,
          descansoMedico: createUpHistoryDto.descansoMedico,
          descripDescanso: createUpHistoryDto.descripDescanso,
        });

        // Register audit
        await this.auditService.create({
          entityId: upHistory.id,
          entityType: 'updateHistoria',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return upHistory;
      },
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Actualización de historia médica creada exitosamente',
      data: newUpHistory,
    };
  }
}
