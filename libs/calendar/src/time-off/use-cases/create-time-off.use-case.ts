import { Injectable } from '@nestjs/common';
import { TimeOff } from '../entities/time-off.entity';
import { TimeOffRepository } from '../repositories/time-off.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';
import { CreateTimeOffDto } from '../dto/create-time-off.dto';

@Injectable()
export class CreateTimeOffUseCase {
  constructor(
    private readonly timeOffRepository: TimeOffRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createTimeOffDto: CreateTimeOffDto,
    user: UserData,
  ): Promise<BaseApiResponse<TimeOff>> {
    // Verificar si hay ausencias conflictivas
    const conflictingTimeOffs = await this.timeOffRepository.findConflictingTimeOffs(
      createTimeOffDto.staffId,
      createTimeOffDto.start,
      createTimeOffDto.end,
    );

    if (conflictingTimeOffs.length > 0) {
      throw new Error('Ya existe una ausencia programada para este período');
    }

    // Crear la ausencia usando una transacción
    const newTimeOff = await this.timeOffRepository.transaction(async () => {
      // Crear la ausencia
      const timeOff = await this.timeOffRepository.create({
        ...createTimeOffDto,
        isActive: true,
      });

      // Registrar auditoría
      await this.auditService.create({
        entityId: timeOff.id,
        entityType: 'time-off',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return timeOff;
    });

    return {
      success: true,
      message: 'Ausencia temporal creada exitosamente',
      data: newTimeOff,
    };
  }
}
