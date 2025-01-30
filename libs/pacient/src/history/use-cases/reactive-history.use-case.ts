import { Injectable } from '@nestjs/common';
import { MedicalHistoryRepository } from '../repositories/history.repository';
import { MedicalHistory } from '../entities/history.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateMedicalHistoryUseCase {
  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory[]>> {
    // Reactivar las historias y registrar auditoría
    const reactivatedHistories =
      await this.medicalHistoryRepository.transaction(async () => {
        const histories =
          await this.medicalHistoryRepository.reactivateMany(ids);

        // Registrar auditoría para cada historia reactivada
        await Promise.all(
          histories.map((history) =>
            this.auditService.create({
              entityId: history.id,
              entityType: 'medicalHistory',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return histories;
      });

    return {
      success: true,
      message: 'Historias médicas reactivadas exitosamente',
      data: reactivatedHistories,
    };
  }
}
