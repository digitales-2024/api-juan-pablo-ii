import { HttpStatus, Injectable } from '@nestjs/common';
import { SpecializationRepository } from '../repositories/specialization.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Specialization } from '../entities/staff.entity';
import { AuditActionType } from '@prisma/client';
import { DeleteSpecializationDto } from '../dto';

@Injectable()
export class DeleteSpecializationUseCase {
  constructor(
    private readonly specializationRepository: SpecializationRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteSpecializationDto: DeleteSpecializationDto,
    user: UserData,
  ): Promise<HttpResponse<Specialization[]>> {
    const deletedSpecializations =
      await this.specializationRepository.transaction(async () => {
        // Realiza el soft delete y obtiene las especialidades actualizadas
        const specializations =
          await this.specializationRepository.softDeleteMany(
            deleteSpecializationDto.ids,
          );

        // Registra la auditoría para cada especialidad eliminada
        await Promise.all(
          specializations.map((specialization) =>
            this.auditService.create({
              entityId: specialization.id,
              entityType: 'especialidad',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return specializations;
      });

    return {
      statusCode: HttpStatus.OK,
      message: 'Especialidades eliminadas exitosamente',
      data: deletedSpecializations,
    };
  }
}
