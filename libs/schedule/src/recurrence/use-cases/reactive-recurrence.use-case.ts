import { Injectable } from '@nestjs/common';
import { RecurrenceRepository } from '../repositories/recurrence.repository';
import { Recurrence } from '../entities/recurrence.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateRecurrenceUseCase {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Recurrence[]>> {
    // Reactivar las recurrencias y registrar auditoría
    const reactivatedRecurrences = await this.recurrenceRepository.transaction(
      async () => {
        const recurrences = await this.recurrenceRepository.reactivateMany(ids);

        // Registrar auditoría para cada recurrencia reactivada
        await Promise.all(
          recurrences.map((recurrence) =>
            this.auditService.create({
              entityId: recurrence.id,
              entityType: 'recurrencia',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return recurrences;
      },
    );

    return {
      success: true,
      message: 'Recurrencias reactivadas exitosamente',
      data: reactivatedRecurrences,
    };
  }
}
