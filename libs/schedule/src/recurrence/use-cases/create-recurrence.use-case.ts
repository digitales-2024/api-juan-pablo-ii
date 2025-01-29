import { Injectable } from '@nestjs/common';
import { CreateRecurrenceDto } from '../dto/create-recurrence.dto';
import { Recurrence } from '../entities/recurrence.entity';
import { RecurrenceRepository } from '../repositories/recurrence.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateRecurrenceUseCase {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createRecurrenceDto: CreateRecurrenceDto,
    user: UserData,
  ): Promise<BaseApiResponse<Recurrence>> {
    const newRecurrence = await this.recurrenceRepository.transaction(
      async () => {
        // Create recurrence
        const recurrence = await this.recurrenceRepository.create({
          frequency: createRecurrenceDto.frequency,
          interval: createRecurrenceDto.interval,
          daysOfWeek: createRecurrenceDto.daysOfWeek,
          exceptions: createRecurrenceDto.exceptions,
          startDate: createRecurrenceDto.startDate,
          endDate: createRecurrenceDto.endDate,
          isActive: createRecurrenceDto.isActive,
        });

        // Register audit
        await this.auditService.create({
          entityId: recurrence.id,
          entityType: 'recurrencia',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return recurrence;
      },
    );

    return {
      success: true,
      message: 'Recurrencia creada exitosamente',
      data: newRecurrence,
    };
  }
}
