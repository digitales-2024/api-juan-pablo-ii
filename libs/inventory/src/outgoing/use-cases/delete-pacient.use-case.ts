import { HttpStatus, Injectable } from '@nestjs/common';
import { PacientRepository } from '../repositories/pacient.repository';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { Paciente } from '../entities/pacient.entity';
import { AuditActionType } from '@prisma/client';
import { DeletePacientDto } from '../dto/delete-pacient.dto';

@Injectable()
export class DeletePacientsUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deletePacientsDto: DeletePacientDto,
    user: UserData,
  ): Promise<HttpResponse<Paciente[]>> {
    const deletedPacients = await this.pacientRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los pacientes actualizados
        const pacient = await this.pacientRepository.softDeleteMany(
          deletePacientsDto.ids,
        );

        // Registra la auditoría para cada paciente eliminado
        await Promise.all(
          pacient.map((paciente) =>
            this.auditService.create({
              entityId: paciente.id,
              entityType: 'paciente',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return pacient;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Pacientes eliminados exitosamente',
      data: deletedPacients,
    };
  }
}
