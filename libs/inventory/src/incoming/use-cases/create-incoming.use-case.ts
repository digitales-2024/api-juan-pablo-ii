import { Injectable } from '@nestjs/common';
import { CreateIncomingDto } from '../dto/create-incoming.dto';
import { Incoming, IncomingWithStorage } from '../entities/incoming.entity';
import { IncomingRepository } from '../repositories/incoming.repository';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { CreateIncomingDtoStorage } from '../dto/create-incomingStorage.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class CreateIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createIncomingDto: CreateIncomingDto,
    user: UserData,
  ): Promise<BaseApiResponse<Incoming>> {
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
      success: true,
      message: 'Ingreso creado exitosamente',
      data: newIncoming,
    };
  }

  async createIncomingStorage(
    createIncomingDtoStorage: CreateIncomingDtoStorage,
    user: UserData,
  ): Promise<IncomingWithStorage> {
    // Cambiamos el tipo de retorno a string para devolver solo el ID
    // Llamada a la función execute para crear un nuevo ingreso
    const dataIncomingStorage = await this.execute(
      createIncomingDtoStorage,
      user,
    ).then((response) =>
      this.incomingRepository.findWithStorageById(response.data.id),
    );

    // Extraer el ID usando la función privada
    // const idIncoming = this.extractId(dataIncomingStorage);
    // const idIncoming = dataIncomingStorage.data.id;

    // Retornar el ID extraído
    return dataIncomingStorage;
  }

  // private extractId(dataIncomingStorage: BaseApiResponse<Incoming>): string {
  //   // Verificar si la respuesta contiene datos y extraer el ID
  //   if (
  //     dataIncomingStorage &&
  //     dataIncomingStorage.data &&
  //     dataIncomingStorage.data.id
  //   ) {
  //     return dataIncomingStorage.data.id; // Retorna el ID del ingreso creado
  //   } else {
  //     throw new Error('ID no encontrado en la respuesta'); // Manejo de errores si no se encuentra el ID
  //   }
  // }
}
