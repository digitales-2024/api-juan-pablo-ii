import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateMovementDto } from '../dto/update-movement.dto';
import { Movement } from '../entities/movement.entity';
import { MovementRepository } from '../repositories/movement.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateMovementUseCase {
  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateMovementDto: UpdateMovementDto,
    user: UserData,
  ): Promise<HttpResponse<Movement>> {
    const updatedMovement = await this.movementRepository.transaction(
      async () => {
        // Update movement
        const movement = await this.movementRepository.update(id, {
          movementTypeId: updateMovementDto.movementTypeId,
          incomingId: updateMovementDto.incomingId,
          outgoingId: updateMovementDto.outgoingId,
          productoId: updateMovementDto.productoId,
          quantity: updateMovementDto.quantity,
          state: updateMovementDto.state,
        });

        // Register audit
        await this.auditService.create({
          entityId: movement.id,
          entityType: 'movimiento',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return movement;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Movimiento actualizado exitosamente',
      data: updatedMovement,
    };
  }
}
