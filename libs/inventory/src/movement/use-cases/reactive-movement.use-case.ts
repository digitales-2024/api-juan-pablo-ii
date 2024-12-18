import { HttpStatus, Injectable } from '@nestjs/common';
import { MovementRepository } from '../repositories/movement.repository';
import { Movement } from '../entities/movement.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivateMovementUseCase {
  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<Movement[]>> {
    // Reactivar los movimientos y registrar auditoría
    const reactivatedMovements = await this.movementRepository.transaction(
      async () => {
        const movements = await this.movementRepository.reactivateMany(ids);

        // Registrar auditoría para cada movimiento reactivado
        await Promise.all(
          movements.map((movement) =>
            this.auditService.create({
              entityId: movement.id,
              entityType: 'movimiento',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return movements;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Movimientos reactivados exitosamente',
      data: reactivatedMovements,
    };
  }
}
