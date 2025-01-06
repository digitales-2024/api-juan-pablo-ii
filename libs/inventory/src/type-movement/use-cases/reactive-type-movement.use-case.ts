import { HttpStatus, Injectable } from '@nestjs/common';
import { TypeMovementRepository } from '../repositories/type-movement.repository';
import { TypeMovement } from '../entities/type-movement.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class ReactivateTypeMovementUseCase {
  constructor(
    private readonly typeMovementRepository: TypeMovementRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<HttpResponse<TypeMovement[]>> {
    // Reactivar los tipos de movimiento y registrar auditoría
    const reactivatedTypeMovements =
      await this.typeMovementRepository.transaction(async () => {
        const typeMovements =
          await this.typeMovementRepository.reactivateMany(ids);

        // Registrar auditoría para cada tipo de movimiento reactivado
        await Promise.all(
          typeMovements.map((typeMovement) =>
            this.auditService.create({
              entityId: typeMovement.id,
              entityType: 'tipoMovimiento',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return typeMovements;
      });

    return {
      statusCode: HttpStatus.OK,
      message: 'Tipos de movimiento reactivados exitosamente',
      data: reactivatedTypeMovements,
    };
  }
}
