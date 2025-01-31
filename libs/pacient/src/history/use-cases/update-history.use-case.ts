import { Injectable } from '@nestjs/common';
import { MedicalHistory } from '../entities/history.entity';
import { MedicalHistoryRepository } from '../repositories/history.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { UpdateMedicalHistoryDto } from '../dto/update-history.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateMedicalHistoryUseCase {
  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateMedicalHistoryDto: UpdateMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory>> {
    const updatedMedicalHistory =
      await this.medicalHistoryRepository.transaction(async () => {
        // Update medical history
        const medicalHistory = await this.medicalHistoryRepository.update(id, {
          patientId: updateMedicalHistoryDto.patientId,
          medicalHistory: updateMedicalHistoryDto.medicalHistory,
          description: updateMedicalHistoryDto.description,
        });

        // Register audit
        await this.auditService.create({
          entityId: medicalHistory.id,
          entityType: 'medicalHistory',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return medicalHistory;
      });

    return {
      success: true,
      message: 'Historia médica actualizada exitosamente',
      data: updatedMedicalHistory,
    };
  }
}
