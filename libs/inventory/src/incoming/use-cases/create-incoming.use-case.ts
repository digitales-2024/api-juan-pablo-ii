import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateIncomingDto } from '../dto/create-incoming.dto';
import { Incoming } from '../entities/incoming.entity';
import { IncomingRepository } from '../repositories/incoming.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { CreateIncomingDtoStorage } from '../dto/create-incomingStorage.dto';

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

  async createIncomingStorage(
    createIncomingDtoStorage: CreateIncomingDtoStorage,
    user: UserData,
  ): Promise<string> {
    // Cambiamos el tipo de retorno a string para devolver solo el ID
    // Llamada a la función execute para crear un nuevo ingreso
    const dataIncomingStorage = await this.execute(
      createIncomingDtoStorage,
      user,
    );

    // Extraer el ID usando la función privada
    const idIncoming = this.extractId(dataIncomingStorage);

    // Retornar el ID extraído
    return idIncoming;
  }

  private extractId(dataIncomingStorage: HttpResponse<Incoming>): string {
    // Verificar si la respuesta contiene datos y extraer el ID
    if (
      dataIncomingStorage &&
      dataIncomingStorage.data &&
      dataIncomingStorage.data.id
    ) {
      return dataIncomingStorage.data.id; // Retorna el ID del ingreso creado
    } else {
      throw new Error('ID no encontrado en la respuesta'); // Manejo de errores si no se encuentra el ID
    }
  }
}
