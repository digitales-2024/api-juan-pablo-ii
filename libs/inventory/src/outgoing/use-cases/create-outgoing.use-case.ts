import { Injectable } from '@nestjs/common';
import { CreateOutgoingDto } from '../dto/create-outgoing.dto';
import { DetailedOutgoing, Outgoing } from '../entities/outgoing.entity';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { CreateOutgoingDtoStorage } from '../dto/create-outgoingStorage.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateOutgoingUseCase {
  constructor(
    private readonly outgoingRepository: OutgoingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createOutgoingDto: CreateOutgoingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Outgoing>> {
    const newOutgoing = await this.outgoingRepository.transaction(async () => {
      // Create outgoing
      const outgoing = await this.outgoingRepository.create({
        name: createOutgoingDto.name,
        description: createOutgoingDto.description,
        storageId: createOutgoingDto.storageId,
        state: createOutgoingDto.state,
        isTransference: createOutgoingDto?.isTransference,
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
      success: true,
      message: 'Salida creada exitosamente',
      data: newOutgoing,
    };
  }

  //
  async createOugoingStorage(
    createOutgoingDtoStorage: CreateOutgoingDtoStorage,
    user: UserData,
  ): Promise<DetailedOutgoing> {
    // Llamada a la función execute para crear una nueva salida
    const dataOutgoingStorage = await this.execute(
      createOutgoingDtoStorage,
      user,
    ).then((response) =>
      this.outgoingRepository.findDetailedOutgoingById(response.data.id),
    );

    return dataOutgoingStorage;
  }
}
