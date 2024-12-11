import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { Category } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { HttpResponse, UserData } from '@login/login/interfaces';
import { AuditService } from '@login/login/admin/audit/audit.service';
import { AuditActionType } from '@prisma/client';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createCategoryDto: CreateCategoryDto,
    user: UserData,
  ): Promise<HttpResponse<Category>> {
    const newCategory = await this.categoryRepository.transaction(async () => {
      // Create category
      const category = await this.categoryRepository.create({
        name: createCategoryDto.name,
        description: createCategoryDto.description,
      });

      // Register audit
      await this.auditService.create({
        entityId: category.id,
        entityType: 'categoria',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return category;
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Categoría creada exitosamente',
      data: newCategory,
    };
  }
}
