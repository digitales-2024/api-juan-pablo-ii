import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateTypeMovementDto } from '../dto/update-type-movement.dto';
import { TypeMovement } from '../entities/type-movement.entity';
import { TypeMovementRepository } from '../repositories/type-movement.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateTypeMovementUseCase {
  constructor(
    private readonly typeMovementRepository: TypeMovementRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateTypeMovementDto: UpdateTypeMovementDto,
    user: UserData,
  ): Promise<HttpResponse<TypeMovement>> {
    const updatedTypeMovement = await this.typeMovementRepository.transaction(
      async () => {
        // Update type movement
        const typeMovement = await this.typeMovementRepository.update(id, {
          orderId: updateTypeMovementDto.orderId,
          referenceId: updateTypeMovementDto.referenceId,
          name: updateTypeMovementDto.name,
          description: updateTypeMovementDto.description,
          state: updateTypeMovementDto.state,
          isIncoming: updateTypeMovementDto.isIncoming,
          tipoExterno: updateTypeMovementDto.tipoExterno,
        });

        // Register audit
        await this.auditService.create({
          entityId: typeMovement.id,
          entityType: 'tipoMovimiento',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return typeMovement;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Tipo de movimiento actualizado exitosamente',
      data: updatedTypeMovement,
    };
  }
}
