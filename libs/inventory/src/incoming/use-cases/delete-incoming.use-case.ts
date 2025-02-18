import { Injectable } from '@nestjs/common';
import { IncomingRepository } from '../repositories/incoming.repository';
import { DetailedIncoming } from '../entities/incoming.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteIncomingDto } from '../dto/delete-incoming.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteIncomingUseCase {
  constructor(
    private readonly incomingRepository: IncomingRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteIncomingDto: DeleteIncomingDto,
    user: UserData,
  ): Promise<BaseApiResponse<DetailedIncoming[]>> {
    const deletedIncomings = await this.incomingRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene los ingresos actualizados
        const incomings = await this.incomingRepository.softDeleteMany(
          deleteIncomingDto.ids,
        );

        // Registra la auditoría para cada ingreso eliminado
        await Promise.all(
          incomings.map((incoming) =>
            this.auditService.create({
              entityId: incoming.id,
              entityType: 'ingreso',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        // const detailedModifiedIncomings =
        //   await this.incomingRepository.findManyDetailedIncomingById(
        //     deleteIncomingDto.ids,
        //   );

        // const incomingsIds: string[][] = detailedModifiedIncomings.map(
        //   (incoming) => incoming.Movement.map((movement) => movement.id),
        // );

        // const totalQuantityInMovements: number[] =
        //   detailedModifiedIncomings.map((incoming) => {
        //     const stock = incoming.Movement[0].Producto.
        //     const totalQuantity = incoming.Movement.reduce(
        //       (acc, movement) => acc + movement.quantity,
        //       0,
        //     );
        //   });

        //Modificación peligrosa del stock
        // await Promise.all(
        //   detailedIncomings.map((incoming) => {
        //     this.incomingRepository
        //   }),
        // );

        return await this.incomingRepository.getAllDetailedIncoming();
      },
    );

    return {
      success: true,
      message: 'Ingresos eliminados exitosamente',
      data: deletedIncomings,
    };
  }
}
