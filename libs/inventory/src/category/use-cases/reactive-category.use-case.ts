import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../entities/category.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class ReactivateCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Category[]>> {
    // Reactivar las categorías y registrar auditoría
    const reactivatedCategories = await this.categoryRepository.transaction(
      async () => {
        const categories = await this.categoryRepository.reactivateMany(ids);

        // Registrar auditoría para cada categoría reactivada
        await Promise.all(
          categories.map((category) =>
            this.auditService.create({
              entityId: category.id,
              entityType: 'categoria',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return categories;
      },
    );

    return {
      success: true,
      message: 'Categorías reactivadas exitosamente',
      data: reactivatedCategories,
    };
  }
}
