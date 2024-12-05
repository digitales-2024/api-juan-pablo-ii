import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateRecurrenceDto } from '../dto/update-recurrence.dto';
import { Recurrence } from '../entities/recurrence.entity';
import { RecurrenceRepository } from '../repositories/recurrence.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

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
  ): Promise<HttpResponse<Recurrence>> {
    const updatedRecurrence = await this.recurrenceRepository.transaction(
      async () => {
        // Update recurrence
        const recurrence = await this.recurrenceRepository.update(id, {
          calendarioId: updateRecurrenceDto.calendarioId,
          frecuencia: updateRecurrenceDto.frecuencia,
          intervalo: updateRecurrenceDto.intervalo,
          fechaInicio: updateRecurrenceDto.fechaInicio,
          fechaFin: updateRecurrenceDto.fechaFin,
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
      statusCode: HttpStatus.OK,
      message: 'Recurrencia actualizada exitosamente',
      data: updatedRecurrence,
    };
  }
}
