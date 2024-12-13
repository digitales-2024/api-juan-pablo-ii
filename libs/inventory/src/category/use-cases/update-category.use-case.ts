import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: UserData,
  ): Promise<HttpResponse<Category>> {
    const updatedCategory = await this.categoryRepository.transaction(
      async () => {
        // Update category
        const category = await this.categoryRepository.update(id, {
          name: updateCategoryDto.name,
          description: updateCategoryDto.description,
        });

        // Register audit
        await this.auditService.create({
          entityId: category.id,
          entityType: 'categoria',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return category;
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Categoría actualizada exitosamente',
      data: updatedCategory,
    };
  }
}
