import { Injectable } from '@nestjs/common';
import { PacientRepository } from '../repositories/pacient.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { UserData } from '@login/login/interfaces';
import { Patient } from '../entities/pacient.entity';
import { AuditActionType } from '@prisma/client';
import { DeletePatientDto } from '../dto/delete-pacient.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeletePatientsUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deletePatientsDto: DeletePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient[]>> {
    const deletedPatients = await this.pacientRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los pacientes actualizados
        const patient = await this.pacientRepository.softDeleteMany(
          deletePatientsDto.ids,
        );

        // Registra la auditoría para cada paciente eliminado
        await Promise.all(
          patient.map((patient) =>
            this.auditService.create({
              entityId: patient.id,
              entityType: 'paciente',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return patient;
      },
    );

    return {
      success: true,
      message: 'Pacientes eliminados exitosamente',
      data: deletedPatients,
    };
  }
}
