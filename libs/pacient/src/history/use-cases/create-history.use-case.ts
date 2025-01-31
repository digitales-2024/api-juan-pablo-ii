import { Injectable } from '@nestjs/common';
import { CreateMedicalHistoryDto } from '../dto/create-history.dto';
import { MedicalHistory } from '../entities/history.entity';
import { MedicalHistoryRepository } from '../repositories/history.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateMedicalHistoryUseCase {
  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createMedicalHistoryDto: CreateMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory>> {
    const newMedicalHistory = await this.medicalHistoryRepository.transaction(
      async () => {
        // Create medical history
        const medicalHistory = await this.medicalHistoryRepository.create({
          patientId: createMedicalHistoryDto.patientId,
          medicalHistory: createMedicalHistoryDto.medicalHistory,
          description: createMedicalHistoryDto.description,
          isActive: true,
        });

        // Register audit
        await this.auditService.create({
          entityId: medicalHistory.id,
          entityType: 'medicalHistory',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return medicalHistory;
      },
    );

    return {
      success: true,
      message: 'Historia médica creada exitosamente',
      data: newMedicalHistory,
    };
  }
}
