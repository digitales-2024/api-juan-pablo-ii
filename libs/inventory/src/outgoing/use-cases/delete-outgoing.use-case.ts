import { HttpStatus, Injectable } from '@nestjs/common';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { Outgoing } from '../entities/outgoing.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteOutgoingDto } from '../dto/delete-outgoing.dto';

@Injectable()
export class DeleteOutgoingUseCase {
  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteOutgoingDto: DeleteOutgoingDto,
    user: UserData,
  ): Promise<HttpResponse<Outgoing[]>> {
    const deletedOutgoings = await this.outgoingRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las salidas actualizadas
        const outgoings = await this.outgoingRepository.softDeleteMany(
          deleteOutgoingDto.ids,
        );

        // Registra la auditoría para cada salida eliminada
        await Promise.all(
          outgoings.map((outgoing) =>
            this.auditService.create({
              entityId: outgoing.id,
              entityType: 'salida',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return outgoings;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Salidas eliminadas exitosamente',
      data: deletedOutgoings,
    };
  }
}
