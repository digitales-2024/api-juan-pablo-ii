# 📦 Módulo Inventory - Documentación Técnica

## 🎯 Descripción General

El módulo **Inventory** es el sistema de gestión de inventario médico que controla productos, almacenes, movimientos de stock, y todo el flujo de entrada y salida de productos médicos. Maneja categorías, tipos de productos, almacenes, y movimientos con auditoría completa.

## 🏗️ Arquitectura del Módulo

### **Estructura de Directorios**
```
📁 inventory/
├── 📁 src/
│   ├── 📁 category/              # Gestión de categorías de productos
│   ├── 📁 type-product/          # Tipos de productos (subcategorías)
│   ├── 📁 product/               # Productos médicos
│   ├── 📁 type-storage/          # Tipos de almacén
│   ├── 📁 storage/               # Almacenes físicos
│   ├── 📁 type-movement/         # Tipos de movimientos
│   ├── 📁 movement/              # Movimientos de inventario
│   ├── 📁 incoming/              # Entradas de productos
│   ├── 📁 outgoing/              # Salidas de productos
│   ├── 📁 stock/                 # Control de stock
│   ├── 📁 compensation/          # Compensaciones de inventario
│   ├── 📁 events/                # Eventos del módulo
│   ├── inventory.module.ts       # Configuración del módulo
│   └── README.md                 # Esta documentación
```

### **Patrón Arquitectónico**
- **Clean Architecture** con separación de responsabilidades
- **Use Cases** para operaciones específicas
- **Repository Pattern** para acceso a datos
- **Event-Driven** para actualizaciones automáticas de stock

## 🔧 Dependencias del Módulo

### **Módulos Internos**
```typescript
imports: [
  AuditModule,           // Auditoría de acciones
  // Módulos específicos de inventario
]
```

### **Dependencias Externas**
- `@nestjs/common` - Decoradores y utilidades
- `@nestjs/swagger` - Documentación API
- `@prisma/client` - Tipos de base de datos
- `class-validator` - Validación de datos
- `class-transformer` - Transformación de datos

## 📊 Modelos de Datos

### **Entidades Principales**

#### **Categorías y Productos**
```typescript
interface Categoria {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface TipoProducto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Producto {
  id: string;
  categoriaId: string;
  tipoProductoId: string;
  name: string;
  precio: number;
  unidadMedida?: string;
  proveedor?: string;
  uso: ProductUse;
  usoProducto?: string;
  description?: string;
  codigoProducto?: string;
  descuento?: number;
  observaciones?: string;
  condicionesAlmacenamiento?: string;
  isActive: boolean;
  imagenUrl?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### **Almacenes y Stock**
```typescript
interface TypeStorage {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Storage {
  id: string;
  name: string;
  location?: string;
  typeStorageId: string;
  branchId?: string;
  staffId?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Stock {
  id: string;
  storageId: string;
  productId: string;
  stock: number;
  price: number;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### **Movimientos**
```typescript
interface MovementType {
  id: string;
  orderId?: string;
  referenceId?: string;
  name?: string;
  description?: string;
  state: boolean;
  isIncoming?: boolean;
  tipoExterno?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Movement {
  id: string;
  movementTypeId: string;
  storageId: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  reference?: string;
  notes?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Incoming {
  id: string;
  storageId: string;
  supplierId?: string;
  orderId?: string;
  reference?: string;
  notes?: string;
  total: number;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Outgoing {
  id: string;
  storageId: string;
  customerId?: string;
  orderId?: string;
  reference?: string;
  notes?: string;
  total: number;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### **Enums Utilizados**
```typescript
enum ProductUse {
  VENTA      // Para venta directa
  INTERNO    // Para uso interno
}

enum MovementState {
  PENDING    // Pendiente de procesar
  COMPLETED  // Completado
  CANCELLED  // Cancelado
}
```

## 🚀 Casos de Uso (Use Cases)

### **1. Gestión de Productos**
- **CreateProductUseCase**: Crear nuevo producto
- **UpdateProductUseCase**: Actualizar producto existente
- **DeleteProductsUseCase**: Eliminar productos (soft delete)
- **ReactivateProductUseCase**: Reactivar productos eliminados

### **2. Gestión de Almacenes**
- **CreateStorageUseCase**: Crear nuevo almacén
- **UpdateStorageUseCase**: Actualizar almacén
- **DeleteStorageUseCase**: Eliminar almacén
- **ReactivateStorageUseCase**: Reactivar almacén

### **3. Gestión de Movimientos**
- **CreateMovementUseCase**: Registrar movimiento de inventario
- **UpdateMovementUseCase**: Actualizar movimiento
- **DeleteMovementUseCase**: Eliminar movimiento
- **ReactivateMovementUseCase**: Reactivar movimiento

### **4. Gestión de Stock**
- **CreateStockUseCase**: Crear registro de stock
- **UpdateStockUseCase**: Actualizar stock
- **CompensationService**: Compensaciones de inventario

### **5. Entradas y Salidas**
- **CreateIncomingUseCase**: Registrar entrada de productos
- **UpdateIncomingUseCase**: Actualizar entrada
- **CreateOutgoingUseCase**: Registrar salida de productos
- **UpdateOutgoingUseCase**: Actualizar salida

## 📡 Endpoints API

### **Categorías**
```typescript
// GET /api/v1/inventory/categories
// POST /api/v1/inventory/categories
// PUT /api/v1/inventory/categories/:id
// DELETE /api/v1/inventory/categories/:id
// POST /api/v1/inventory/categories/:id/reactivate
```

### **Tipos de Producto**
```typescript
// GET /api/v1/inventory/type-products
// POST /api/v1/inventory/type-products
// PUT /api/v1/inventory/type-products/:id
// DELETE /api/v1/inventory/type-products/:id
// POST /api/v1/inventory/type-products/:id/reactivate
```

### **Productos**
```typescript
// GET /api/v1/inventory/products
// POST /api/v1/inventory/products
// PUT /api/v1/inventory/products/:id
// DELETE /api/v1/inventory/products/:id
// POST /api/v1/inventory/products/:id/reactivate
// GET /api/v1/inventory/products/search?q=paracetamol
```

### **Almacenes**
```typescript
// GET /api/v1/inventory/storages
// POST /api/v1/inventory/storages
// PUT /api/v1/inventory/storages/:id
// DELETE /api/v1/inventory/storages/:id
// POST /api/v1/inventory/storages/:id/reactivate
```

### **Movimientos**
```typescript
// GET /api/v1/inventory/movements
// POST /api/v1/inventory/movements
// PUT /api/v1/inventory/movements/:id
// DELETE /api/v1/inventory/movements/:id
// POST /api/v1/inventory/movements/:id/reactivate
```

### **Stock**
```typescript
// GET /api/v1/inventory/stock
// GET /api/v1/inventory/stock/:storageId
// GET /api/v1/inventory/stock/product/:productId
// PUT /api/v1/inventory/stock/:id
```

### **Entradas**
```typescript
// GET /api/v1/inventory/incoming
// POST /api/v1/inventory/incoming
// PUT /api/v1/inventory/incoming/:id
// DELETE /api/v1/inventory/incoming/:id
// POST /api/v1/inventory/incoming/:id/reactivate
```

### **Salidas**
```typescript
// GET /api/v1/inventory/outgoing
// POST /api/v1/inventory/outgoing
// PUT /api/v1/inventory/outgoing/:id
// DELETE /api/v1/inventory/outgoing/:id
// POST /api/v1/inventory/outgoing/:id/reactivate
```

## 🔒 Seguridad y Autorización

### **Decoradores de Autenticación**
```typescript
@Auth()                    // Requiere autenticación
@GetUser() user: UserData  // Obtiene datos del usuario
@GetUserBranch() branch: UserBranchData  // Obtiene sucursal del usuario
```

### **Validaciones de Permisos**
- Solo personal autorizado puede gestionar inventario
- Validación por sucursal del usuario
- Auditoría de todas las operaciones críticas

## 🔄 Eventos y Notificaciones

### **Eventos del Sistema**
```typescript
// Al crear movimiento
MovementCreatedEvent {
  movementId: string;
  productId: string;
  storageId: string;
  quantity: number;
  type: 'INCOMING' | 'OUTGOING';
}

// Al actualizar stock
StockUpdatedEvent {
  productId: string;
  storageId: string;
  oldStock: number;
  newStock: number;
  movementId: string;
}

// Alerta de stock bajo
LowStockAlertEvent {
  productId: string;
  storageId: string;
  currentStock: number;
  minimumStock: number;
}
```

### **Suscripciones a Eventos**
```typescript
@EventPattern('movement.created')
@EventPattern('stock.updated')
@EventPattern('low.stock.alert')
```

## 📊 Validaciones de Negocio

### **Reglas de Inventario**
1. **Stock Negativo**: No permitir stock negativo sin compensación
2. **Movimientos**: Todo movimiento debe tener tipo y referencia
3. **Precios**: Precios deben ser positivos
4. **Cantidades**: Cantidades deben ser positivas
5. **Almacenes**: Productos solo pueden estar en almacenes activos

### **Validaciones de Datos**
```typescript
// Ejemplo de validación en DTO
@IsString()
@IsNotEmpty()
name: string;

@IsNumber()
@IsPositive()
precio: number;

@IsEnum(ProductUse)
uso: ProductUse;

@IsOptional()
@IsString()
description?: string;
```

## 🗄️ Acceso a Datos

### **Repository Pattern**
```typescript
class ProductRepository {
  async create(data: CreateProductData): Promise<Producto>
  async findById(id: string): Promise<Producto | null>
  async findByName(name: string): Promise<Producto[]>
  async update(id: string, data: UpdateProductData): Promise<Producto>
  async delete(id: string): Promise<void>
  async findPaginated(filters: ProductFilters): Promise<PaginatedResult<Producto>>
}

class StockRepository {
  async findByStorage(storageId: string): Promise<Stock[]>
  async findByProduct(productId: string): Promise<Stock[]>
  async updateStock(storageId: string, productId: string, quantity: number): Promise<Stock>
  async getLowStockProducts(threshold: number): Promise<Stock[]>
}

class MovementRepository {
  async create(data: CreateMovementData): Promise<Movement>
  async findByStorage(storageId: string): Promise<Movement[]>
  async findByProduct(productId: string): Promise<Movement[]>
  async findByDateRange(startDate: Date, endDate: Date): Promise<Movement[]>
}
```

### **Queries Principales**
- Búsqueda de productos por nombre/código
- Consulta de stock por almacén
- Movimientos por rango de fechas
- Productos con stock bajo
- Historial de movimientos por producto

## 🧪 Testing

### **Tipos de Tests Requeridos**
1. **Unit Tests**: Casos de uso individuales
2. **Integration Tests**: Flujo completo de movimientos
3. **E2E Tests**: Endpoints completos
4. **Repository Tests**: Acceso a datos

### **Casos de Prueba Críticos**
- Creación de producto con categoría válida
- Movimiento de entrada con actualización de stock
- Movimiento de salida con stock suficiente
- Movimiento de salida con stock insuficiente
- Compensación de inventario
- Búsqueda de productos con filtros

## 🔧 Configuración

### **Variables de Entorno**
```env
# Configuración de inventario
INVENTORY_LOW_STOCK_THRESHOLD=10
INVENTORY_MAX_STOCK_ALERT=1000
INVENTORY_AUTO_COMPENSATION=true

# Configuración de búsqueda
INVENTORY_SEARCH_MIN_LENGTH=3
INVENTORY_SEARCH_MAX_RESULTS=50
```

### **Configuración del Módulo**
```typescript
@Module({
  imports: [AuditModule],
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
  providers: [
    // Services
    CategoryService,
    TypeProductService,
    ProductService,
    TypeStorageService,
    StorageService,
    TypeMovementService,
    MovementService,
    IncomingService,
    OutgoingService,
    StockService,
    CompensationService,
    
    // Repositories
    CategoryRepository,
    TypeProductRepository,
    ProductRepository,
    TypeStorageRepository,
    StorageRepository,
    TypeMovementRepository,
    MovementRepository,
    IncomingRepository,
    OutgoingRepository,
    StockRepository,
    
    // Use Cases
    // ... todos los use cases
    
    // Event Subscribers
    InventoryEventSubscriber,
  ],
  exports: [
    ProductService,
    StockService,
    MovementService,
  ],
})
```

## 📈 Métricas y Monitoreo

### **Métricas Clave**
- Rotación de inventario por producto
- Productos con stock bajo
- Movimientos por tipo y período
- Valor total del inventario
- Productos más vendidos

### **Logs Importantes**
- Creación de productos
- Movimientos de inventario
- Alertas de stock bajo
- Compensaciones de inventario
- Errores de validación

## 🚨 Manejo de Errores

### **Errores Específicos**
```typescript
class InsufficientStockError extends Error {
  constructor(productId: string, required: number, available: number) {
    super(`Stock insuficiente para producto ${productId}. Requerido: ${required}, Disponible: ${available}`);
  }
}

class InvalidMovementError extends Error {
  constructor(message: string) {
    super(`Movimiento inválido: ${message}`);
  }
}

class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Producto no encontrado: ${productId}`);
  }
}
```

### **Códigos de Error**
- `400`: Datos de entrada inválidos
- `404`: Producto/almacén no encontrado
- `409`: Stock insuficiente
- `422`: Movimiento inválido
- `500`: Error interno del servidor

## 🔄 Compensaciones de Inventario

### **Tipos de Compensación**
1. **Stock Negativo**: Cuando se vende más de lo disponible
2. **Diferencias de Inventario**: Ajustes por conteo físico
3. **Mermas**: Pérdidas por caducidad o daños
4. **Transferencias**: Movimientos entre almacenes

### **Proceso de Compensación**
```typescript
class CompensationService {
  async compensateNegativeStock(movementId: string): Promise<void>
  async adjustInventory(productId: string, storageId: string, adjustment: number): Promise<void>
  async processTransfer(fromStorageId: string, toStorageId: string, productId: string, quantity: number): Promise<void>
}
```

---

*Documentación del módulo Inventory - Sistema API Juan Pablo II*

