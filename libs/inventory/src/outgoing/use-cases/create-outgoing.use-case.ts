import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOutgoingDto } from '../dto/create-outgoing.dto';
import { Outgoing } from '../entities/outgoing.entity';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateOutgoingUseCase {
  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createOutgoingDto: CreateOutgoingDto,
    user: UserData,
  ): Promise<HttpResponse<Outgoing>> {
    const newOutgoing = await this.outgoingRepository.transaction(async () => {
      // Create outgoing
      const outgoing = await this.outgoingRepository.create({
        name: createOutgoingDto.name,
        description: createOutgoingDto.description,
        storageId: createOutgoingDto.storageId,
        state: createOutgoingDto.state,
        referenceId: createOutgoingDto.referenceId,
        date: createOutgoingDto.date,
      });

      // Register audit
      await this.auditService.create({
        entityId: outgoing.id,
        entityType: 'salida',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return outgoing;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Salida creada exitosamente',
      data: newOutgoing,
    };
  }
}
