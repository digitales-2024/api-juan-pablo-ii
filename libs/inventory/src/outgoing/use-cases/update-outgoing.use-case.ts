import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateOutgoingDto } from '../dto/update-outgoing.dto';
import { Outgoing } from '../entities/outgoing.entity';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateOutgoingUseCase {
  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateOutgoingDto: UpdateOutgoingDto,
    user: UserData,
  ): Promise<HttpResponse<Outgoing>> {
    const updatedOutgoing = await this.outgoingRepository.transaction(
      async () => {
        // Update outgoing
        const outgoing = await this.outgoingRepository.update(id, {
          name: updateOutgoingDto.name,
          description: updateOutgoingDto.description,
          storageId: updateOutgoingDto.storageId,
          state: updateOutgoingDto.state,
          referenceId: updateOutgoingDto.referenceId,
          date: updateOutgoingDto.date,
        });

        // Register audit
        await this.auditService.create({
          entityId: outgoing.id,
          entityType: 'salida',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return outgoing;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Salida actualizada exitosamente',
      data: updatedOutgoing,
    };
  }
}
