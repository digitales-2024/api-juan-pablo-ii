import { HttpStatus, Injectable } from '@nestjs/common';
import { TypeMovementRepository } from '../repositories/type-movement.repository';
import { TypeMovement } from '../entities/type-movement.entity';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteTypeMovementDto } from '../dto/delete-type-movement.dto';

@Injectable()
export class DeleteTypeMovementUseCase {
  constructor(
    private readonly typeMovementRepository: TypeMovementRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteTypeMovementDto: DeleteTypeMovementDto,
    user: UserData,
  ): Promise<HttpResponse<TypeMovement[]>> {
    const deletedTypeMovements = await this.typeMovementRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los tipos de movimiento actualizados
        const typeMovements = await this.typeMovementRepository.softDeleteMany(
          deleteTypeMovementDto.ids,
        );

        // Registra la auditoría para cada tipo de movimiento eliminado
        await Promise.all(
          typeMovements.map((typeMovement) =>
            this.auditService.create({
              entityId: typeMovement.id,
              entityType: 'tipoMovimiento',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return typeMovements;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tipos de movimiento eliminados exitosamente',
      data: deletedTypeMovements,
    };
  }
}
