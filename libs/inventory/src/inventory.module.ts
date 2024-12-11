import { Module } from '@nestjs/common';
import { CategoryController } from './category/controllers/category.controller';
import { AuditModule } from '@login/login/admin/audit/audit.module';
import { CategoryService } from './category/services/category.service';
import { CategoryRepository } from './category/repositories/category.repository';
import {
  CreateCategoryUseCase,
  DeleteCategoriesUseCase,
  ReactivateCategoryUseCase,
  UpdateCategoryUseCase,
} from './category/use-cases';

@Module({
  controllers: [CategoryController],
  imports: [AuditModule],
  providers: [
    // categoria
    CategoryService,
    CategoryRepository,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoriesUseCase,
    ReactivateCategoryUseCase,
    //tipo producto

    //producto
  ],
  exports: [InventoryModule],
})
export class InventoryModule {}
