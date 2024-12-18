import { HttpStatus, Injectable } from '@nestjs/common';
import { IncomingRepository } from '../repositories/incoming.repository';
import { Incoming } from '../entities/incoming.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteIncomingDto } from '../dto/delete-incoming.dto';

@Injectable()
export class DeleteIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteIncomingDto: DeleteIncomingDto,
    user: UserData,
  ): Promise<HttpResponse<Incoming[]>> {
    const deletedIncomings = await this.incomingRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los ingresos actualizados
        const incomings = await this.incomingRepository.softDeleteMany(
          deleteIncomingDto.ids,
        );

        // Registra la auditoría para cada ingreso eliminado
        await Promise.all(
          incomings.map((incoming) =>
            this.auditService.create({
              entityId: incoming.id,
              entityType: 'ingreso',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return incomings;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Ingresos eliminados exitosamente',
      data: deletedIncomings,
    };
  }
}
