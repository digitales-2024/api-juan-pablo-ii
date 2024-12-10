import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRecurrenceDto } from '../dto/create-recurrence.dto';
import { Recurrence } from '../entities/recurrence.entity';
import { RecurrenceRepository } from '../repositories/recurrence.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateRecurrenceUseCase {
  constructor(
    private readonly recurrenceRepository: RecurrenceRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createRecurrenceDto: CreateRecurrenceDto,
    user: UserData,
  ): Promise<HttpResponse<Recurrence>> {
    const newRecurrence = await this.recurrenceRepository.transaction(
      async () => {
        // Create recurrence
        const recurrence = await this.recurrenceRepository.create({
          calendarioId: createRecurrenceDto.calendarioId,
          frecuencia: createRecurrenceDto.frecuencia,
          intervalo: createRecurrenceDto.intervalo,
          fechaInicio: createRecurrenceDto.fechaInicio,
          fechaFin: createRecurrenceDto.fechaFin,
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
      statusCode: HttpStatus.CREATED,
      message: 'Recurrencia creada exitosamente',
      data: newRecurrence,
    };
  }
}
