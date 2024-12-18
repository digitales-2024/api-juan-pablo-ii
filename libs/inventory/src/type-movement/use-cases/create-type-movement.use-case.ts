import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTypeMovementDto } from '../dto/create-type-movement.dto';
import { TypeMovement } from '../entities/type-movement.entity';
import { TypeMovementRepository } from '../repositories/type-movement.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateTypeMovementUseCase {
  constructor(
    private readonly typeMovementRepository: TypeMovementRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createTypeMovementDto: CreateTypeMovementDto,
    user: UserData,
  ): Promise<HttpResponse<TypeMovement>> {
    const newTypeMovement = await this.typeMovementRepository.transaction(
      async () => {
        // Create type movement
        const typeMovement = await this.typeMovementRepository.create({
          orderId: createTypeMovementDto.orderId,
          referenceId: createTypeMovementDto.referenceId,
          name: createTypeMovementDto.name,
          description: createTypeMovementDto.description,
          state: createTypeMovementDto.state,
          isIncoming: createTypeMovementDto.isIncoming,
          tipoExterno: createTypeMovementDto.tipoExterno,
        });

        // Register audit
        await this.auditService.create({
          entityId: typeMovement.id,
          entityType: 'tipoMovimiento',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return typeMovement;
      },
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tipo de movimiento creado exitosamente',
      data: newTypeMovement,
    };
  }
}
