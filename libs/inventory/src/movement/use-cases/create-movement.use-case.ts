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
}
