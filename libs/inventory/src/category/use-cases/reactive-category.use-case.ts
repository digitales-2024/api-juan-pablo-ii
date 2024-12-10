import { HttpStatus, Injectable } from '@nestjs/common';
import { PacientRepository } from '../repositories/category.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Paciente } from '../entities/category.entity';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivatePacientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Paciente[]>> {
    // Reactivar los pacientes y registrar auditoría
    const reactivatedPacients = await this.pacientRepository.transaction(
      async () => {
        const pacients = await this.pacientRepository.reactivateMany(ids);

        // Registrar auditoría para cada paciente reactivado
        await Promise.all(
          pacients.map((Pacient) =>
            this.auditService.create({
              entityId: Pacient.id,
              entityType: 'Pacient',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return pacients;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Pacientes reactivados exitosamente',
      data: reactivatedPacients,
    };
  }
}
