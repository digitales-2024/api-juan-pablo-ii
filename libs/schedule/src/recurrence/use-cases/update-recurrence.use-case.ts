import { Injectable } from '@nestjs/common';
import { UpdateRecurrenceDto } from '../dto/update-recurrence.dto';
import { Recurrence } from '../entities/recurrence.entity';
import { RecurrenceRepository } from '../repositories/recurrence.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class UpdateRecurrenceUseCase {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateRecurrenceDto: UpdateRecurrenceDto,
    user: UserData,
  ): Promise<BaseApiResponse<Recurrence>> {
    const updatedRecurrence = await this.recurrenceRepository.transaction(
      async () => {
        // Update recurrence
        const recurrence = await this.recurrenceRepository.update(id, {
          frequency: updateRecurrenceDto.frequency,
          interval: updateRecurrenceDto.interval,
          daysOfWeek: updateRecurrenceDto.daysOfWeek,
          exceptions: updateRecurrenceDto.exceptions,
          startDate: updateRecurrenceDto.startDate,
          endDate: updateRecurrenceDto.endDate,
          isActive: updateRecurrenceDto.isActive,
        });

        // Register audit
        await this.auditService.create({
          entityId: recurrence.id,
          entityType: 'recurrencia',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return recurrence;
      },
    );

    return {
      success: true,
      message: 'Recurrencia actualizada exitosamente',
      data: updatedRecurrence,
    };
  }
}
