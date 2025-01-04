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
import { MovementController } from './movement/controllers/movement.controller';
import { MovementService } from './movement/services/movement.service';
import { MovementRepository } from './movement/repositories/movement.repository';
import {
  CreateMovementUseCase,
  DeleteMovementUseCase,
  ReactivateMovementUseCase,
  UpdateMovementUseCase,
} from './movement/use-cases';
import { IncomingController } from './incoming/controllers/incoming.controller';
import { IncomingService } from './incoming/services/incoming.service';
import { IncomingRepository } from './incoming/repositories/incoming.repository';
import {
  CreateIncomingUseCase,
  DeleteIncomingUseCase,
  ReactivateIncomingUseCase,
  UpdateIncomingUseCase,
} from './incoming/use-cases';
import { OutgoingController } from './outgoing/controllers/outgoing.controller';
import { OutgoingService } from './outgoing/services/outgoing.service';
import { OutgoingRepository } from './outgoing/repositories/outgoing.repository';
import {
  CreateOutgoingUseCase,
  DeleteOutgoingUseCase,
  ReactivateOutgoingUseCase,
  UpdateOutgoingUseCase,
} from './outgoing/use-cases';
import { StockController } from './stock/controllers/stock.controller';
import { StockService } from './stock/services/stock.service';
import { InventoryEventSubscriber } from './events/inventory-event.subscriber';
import { CompensationService } from './compensation/compensation.service';
import { StockRepository } from './stock/repositories/stock.repository';
import { UpdateStockUseCase } from './stock/use-cases/update-storage.use-case';
import { CreateStockUseCase } from './stock/use-cases/create-storage.use-case';

@Module({
  controllers: [
    CategoryController,
    TypeProductController,
    ProductController,
    TypeStorageController,
    StorageController,
    TypeMovementController,
    MovementController,
    IncomingController,
    OutgoingController,
    StockController,
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
    //movimiento
    MovementService,
    MovementRepository,
    CreateMovementUseCase,
    UpdateMovementUseCase,
    DeleteMovementUseCase,
    ReactivateMovementUseCase,
    //ingresos
    IncomingService,
    IncomingRepository,
    CreateIncomingUseCase,
    UpdateIncomingUseCase,
    DeleteIncomingUseCase,
    ReactivateIncomingUseCase,
    //salidas
    OutgoingService,
    OutgoingRepository,
    CreateOutgoingUseCase,
    UpdateOutgoingUseCase,
    DeleteOutgoingUseCase,
    ReactivateOutgoingUseCase,
    //stock
    StockService,
    StockRepository,
    UpdateStockUseCase,
    CreateStockUseCase,
    InventoryEventSubscriber,
    CompensationService,
  ],
  exports: [
    InventoryModule,
    CategoryService,
    TypeProductService,
    ProductService,
    TypeStorageService,
    StorageService,
    TypeMovementService,
    MovementService,
    IncomingService,
    OutgoingService,
    IncomingRepository,
    OutgoingRepository,
    MovementRepository,
    StockService,
    StockRepository,
    UpdateStockUseCase,
    CreateStockUseCase,
  ],
})
export class InventoryModule {}
