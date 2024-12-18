import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateIncomingDto } from '../dto/create-incoming.dto';
import { Incoming } from '../entities/incoming.entity';
import { IncomingRepository } from '../repositories/incoming.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createIncomingDto: CreateIncomingDto,
    user: UserData,
  ): Promise<HttpResponse<Incoming>> {
    const newIncoming = await this.incomingRepository.transaction(async () => {
      // Create incoming
      const incoming = await this.incomingRepository.create({
        name: createIncomingDto.name,
        description: createIncomingDto.description,
        storageId: createIncomingDto.storageId,
        state: createIncomingDto.state,
        referenceId: createIncomingDto.referenceId,
        date: createIncomingDto.date,
      });

      // Register audit
      await this.auditService.create({
        entityId: incoming.id,
        entityType: 'ingreso',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return incoming;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Ingreso creado exitosamente',
      data: newIncoming,
    };
  }
}
