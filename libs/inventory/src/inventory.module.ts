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
import { TypeProductController } from './type-product/controllers/type-product.controller';
import { TypeProductService } from './type-product/services/type-product.service';
import { TypeProductRepository } from './type-product/repositories/type-product.repository';
import {
  CreateTypeProductUseCase,
  DeleteTypeProductsUseCase,
  ReactivateTypeProductUseCase,
  UpdateTypeProductUseCase,
} from './type-product/use-cases';
import { ProductController } from './product/controllers/product.controller';
import { ProductService } from './product/services/product.service';
import { ProductRepository } from './product/repositories/product.repository';
import {
  CreateProductUseCase,
  DeleteProductsUseCase,
  ReactivateProductUseCase,
  UpdateProductUseCase,
} from './product/use-cases';
import { TypeStorageService } from './type-storage/services/type-storage.service';
import { TypeStorageRepository } from './type-storage/repositories/type-storage.repository';
import {
  CreateTypeStorageUseCase,
  DeleteTypeStorageUseCase,
  ReactivateTypeStorageUseCase,
  UpdateTypeStorageUseCase,
} from './type-storage/use-cases';
import { TypeStorageController } from './type-storage/controllers/type-storage.controller';
import { StorageController } from './storage/controllers/storage.controller';
import { StorageService } from './storage/services/storage.service';
import { StorageRepository } from './storage/repositories/storage.repository';
import {
  CreateStorageUseCase,
  DeleteStorageUseCase,
  ReactivateStorageUseCase,
  UpdateStorageUseCase,
} from './storage/use-cases';
import { TypeMovementController } from './type-movement/controllers/type-movement.controller';
import { TypeMovementService } from './type-movement/services/type-movement.service';
import { TypeMovementRepository } from './type-movement/repositories/type-movement.repository';
import {
  CreateTypeMovementUseCase,
  DeleteTypeMovementUseCase,
  ReactivateTypeMovementUseCase,
  UpdateTypeMovementUseCase,
} from './type-movement/use-cases';

@Module({
  controllers: [
    CategoryController,
    TypeProductController,
    ProductController,
    TypeStorageController,
    StorageController,
    TypeMovementController,
  ],
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
    TypeProductService,
    TypeProductRepository,
    CreateTypeProductUseCase,
    UpdateTypeProductUseCase,
    DeleteTypeProductsUseCase,
    ReactivateTypeProductUseCase,
    //producto
    ProductService,
    ProductRepository,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductsUseCase,
    ReactivateProductUseCase,
    //Tipo de almacen,
    TypeStorageService,
    TypeStorageRepository,
    CreateTypeStorageUseCase,
    UpdateTypeStorageUseCase,
    DeleteTypeStorageUseCase,
    ReactivateTypeStorageUseCase,
    // Almacen
    StorageService,
    StorageRepository,
    CreateStorageUseCase,
    UpdateStorageUseCase,
    DeleteStorageUseCase,
    ReactivateStorageUseCase,
    //tipo movimiento
    TypeMovementService,
    TypeMovementRepository,
    CreateTypeMovementUseCase,
    UpdateTypeMovementUseCase,
    DeleteTypeMovementUseCase,
    ReactivateTypeMovementUseCase,
  ],
  exports: [InventoryModule],
})
export class InventoryModule {}
