import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { Category } from '../entities/category.entity';
import { UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import { BaseApiResponse } from 'src/dto/BaseApiResponse.dto';

@Injectable()
export class DeleteCategoriesUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteCategoriesDto: DeleteCategoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<Category[]>> {
    const deletedCategories = await this.categoryRepository.transaction(
      async () => {
        // Realiza el soft delete y obtiene las categorías actualizadas
        const categories = await this.categoryRepository.softDeleteMany(
          deleteCategoriesDto.ids,
        );

        // Registra la auditoría para cada categoría eliminada
        await Promise.all(
          categories.map((category) =>
            this.auditService.create({
              entityId: category.id,
              entityType: 'categoria',
              action: AuditActionType.DELETE,
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
      message: 'Categorías eliminadas exitosamente',
      data: deletedCategories,
    };
  }
}
