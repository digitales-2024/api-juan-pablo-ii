import { Injectable } from '@nestjs/common';
import { RecurrenceRepository } from '../repositories/recurrence.repository';
import { Recurrence } from '../entities/recurrence.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteRecurrenceDto } from '../dto/delete-recurrence.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteRecurrencesUseCase {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteRecurrencesDto: DeleteRecurrenceDto,
    user: UserData,
  ): Promise<BaseApiResponse<Recurrence[]>> {
    const deletedRecurrences = await this.recurrenceRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las recurrencias actualizadas
        const recurrences = await this.recurrenceRepository.softDeleteMany(
          deleteRecurrencesDto.ids,
        );

        // Registra la auditoría para cada recurrencia eliminada
        await Promise.all(
          recurrences.map((recurrence) =>
            this.auditService.create({
              entityId: recurrence.id,
              entityType: 'recurrencia',
              action: AuditActionType.DELETE,
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
      message: 'Recurrencias eliminadas exitosamente',
      data: deletedRecurrences,
    };
  }
}
