import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { Movement } from '../entities/movement.entity';
import { MovementRepository } from '../repositories/movement.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateMovementUseCase {
  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createMovementDto: CreateMovementDto,
    user: UserData,
  ): Promise<HttpResponse<Movement>> {
    const newMovement = await this.movementRepository.transaction(async () => {
      // Create movement
      const movement = await this.movementRepository.create({
        movementTypeId: createMovementDto.movementTypeId,
        incomingId: createMovementDto.incomingId,
        outgoingId: createMovementDto.outgoingId,
        productId: createMovementDto.productId,
        quantity: createMovementDto.quantity,
        date: createMovementDto.date,
        state: createMovementDto.state,
      });

      // Register audit
      await this.auditService.create({
        entityId: movement.id,
        entityType: 'movimiento',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return movement;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Movimiento creado exitosamente',
      data: newMovement,
    };
  }

  // crear un movmiemto de tipo de movimiento
  async createMovementStorage(
    createMovementDto: CreateMovementDto,
    user: UserData,
  ): Promise<string> {
    // Cambiamos el tipo de retorno a string para devolver solo el ID
    // Llamada a la función execute para crear un nuevo MovementType
    const MovementStorage = await this.execute(createMovementDto, user);

    // Extraer el ID usando la función privada
    const idMovement = this.extractId(MovementStorage);

    // Retornar el ID extraído
    return idMovement;
  }

  private extractId(MovementStorage: HttpResponse<Movement>): string {
    // Verificar si la respuesta contiene datos y extraer el ID
    if (MovementStorage && MovementStorage.data && MovementStorage.data.id) {
      return MovementStorage.data.id; // Retorna el ID del ingreso creado
    } else {
      throw new Error('ID no encontrado en la respuesta'); // Manejo de errores si no se encuentra el ID
    }
  }
}
