import { Injectable } from '@nestjs/common';
import { MedicalHistoryRepository } from '../repositories/history.repository';
import { MedicalHistory } from '../entities/history.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteMedicalHistoryDto } from '../dto/delete-history.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteMedicalHistoriesUseCase {
  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteMedicalHistoriesDto: DeleteMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory[]>> {
    const deletedHistories = await this.medicalHistoryRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las historias actualizadas
        const histories = await this.medicalHistoryRepository.softDeleteMany(
          deleteMedicalHistoriesDto.ids,
        );

        // Registra la auditoría para cada historia eliminada
        await Promise.all(
          histories.map((history) =>
            this.auditService.create({
              entityId: history.id,
              entityType: 'medicalHistory',
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
      success: true,
      message: 'Historias médicas eliminadas exitosamente',
      data: deletedHistories,
    };
  }
}
