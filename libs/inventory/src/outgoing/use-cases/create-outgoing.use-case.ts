import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOutgoingDto } from '../dto/create-outgoing.dto';
import { Outgoing } from '../entities/outgoing.entity';
import { OutgoingRepository } from '../repositories/outgoing.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { CreateOutgoingDtoStorage } from '../dto/create-outgoingStorage.dto';

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

  //
  async createOugoingStorage(
    createOutgoingDtoStorage: CreateOutgoingDtoStorage,
    user: UserData,
  ): Promise<string> {
    // Cambiamos el tipo de retorno a string para devolver solo el ID
    // Llamada a la función execute para crear una nueva salida
    const dataOutgoingStorage = await this.execute(
      createOutgoingDtoStorage,
      user,
    );

    // Extraer el ID usando la función privada
    const idIncoming = this.extractId(dataOutgoingStorage);

    // Retornar el ID extraído
    return idIncoming;
  }

  private extractId(dataOutgoingStorage: HttpResponse<Outgoing>): string {
    // Verificar si la respuesta contiene datos y extraer el ID
    if (
      dataOutgoingStorage &&
      dataOutgoingStorage.data &&
      dataOutgoingStorage.data.id
    ) {
      return dataOutgoingStorage.data.id; // Retorna el ID del ingreso creado
    } else {
      throw new Error('ID no encontrado en la respuesta'); // Manejo de errores si no se encuentra el ID
    }
  }
}
