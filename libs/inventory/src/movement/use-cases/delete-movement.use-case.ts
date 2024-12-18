import { HttpStatus, Injectable } from '@nestjs/common';
import { MovementRepository } from '../repositories/movement.repository';
import { Movement } from '../entities/movement.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteMovementDto } from '../dto/delete-movement.dto';

@Injectable()
export class DeleteMovementUseCase {
  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteMovementDto: DeleteMovementDto,
    user: UserData,
  ): Promise<HttpResponse<Movement[]>> {
    const deletedMovements = await this.movementRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los movimientos actualizados
        const movements = await this.movementRepository.softDeleteMany(
          deleteMovementDto.ids,
        );

        // Registra la auditoría para cada movimiento eliminado
        await Promise.all(
          movements.map((movement) =>
            this.auditService.create({
              entityId: movement.id,
              entityType: 'movimiento',
              action: AuditActionType.DELETE,
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
      message: 'Movimientos eliminados exitosamente',
      data: deletedMovements,
    };
  }
}
