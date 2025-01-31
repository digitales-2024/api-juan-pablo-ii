import { Injectable } from '@nestjs/common';
import { PacientRepository } from '../repositories/pacient.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Patient } from '../entities/pacient.entity';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivatePacientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Patient[]>> {
    // Reactivar los pacientes y registrar auditoría
    const reactivatedPatients = await this.pacientRepository.transaction(
      async () => {
        const patients = await this.pacientRepository.reactivateMany(ids);

        // Registrar auditoría para cada paciente reactivado
        await Promise.all(
          patients.map((patient) =>
            this.auditService.create({
              entityId: patient.id,
              entityType: 'Pacient',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return patients;
      },
    );

    return {
      success: true,
      message: 'Pacientes reactivados exitosamente',
      data: reactivatedPatients,
    };
  }
}
