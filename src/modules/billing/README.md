# 💰 Módulo Billing - Documentación Técnica

## 🎯 Descripción General

El módulo **Billing** es el sistema central de facturación del API Juan Pablo II. Maneja la generación de órdenes de facturación para diferentes tipos de transacciones médicas: citas médicas, recetas médicas, ventas de productos y compras de inventario. Integra con el sistema de pagos, inventario y auditoría.

## 🏗️ Arquitectura del Módulo

### **Estructura de Directorios**
```
📁 billing/
├── 📁 controllers/          # Controladores REST
├── 📁 dto/                 # Data Transfer Objects
├── 📁 errors/              # Manejo de errores específicos
├── 📁 generators/          # Generadores de órdenes
├── 📁 interfaces/          # Interfaces y tipos
├── 📁 services/            # Lógica de negocio
├── 📁 use-cases/           # Casos de uso específicos
├── billing.module.ts       # Configuración del módulo
└── README.md              # Esta documentación
```

### **Patrón Arquitectónico**
- **Clean Architecture** con separación de responsabilidades
- **Use Cases** para operaciones específicas
- **Generator Pattern** para crear diferentes tipos de órdenes
- **Event-Driven** para integración con otros módulos

## 🔧 Dependencias del Módulo

### **Módulos Internos**
```typescript
imports: [
  PayModule,              // Sistema de pagos y órdenes
  InventoryModule,        // Control de inventario
  AuditModule,           // Auditoría de acciones
  ServiceModule,         // Servicios médicos
  AppointmentsModule,    // Gestión de citas
  PacientModule,         // Gestión de pacientes
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

#### **Órdenes de Facturación**
```typescript
interface Order {
  id: string;
  code: string;
  type: OrderType;
  status: OrderStatus;
  movementTypeId?: string;
  referenceId?: string;
  sourceId?: string;
  targetId?: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  date: DateTime;
  notes?: string;
  metadata: string; // JSON stringificado
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

#### **Tipos de Órdenes**
```typescript
enum OrderType {
  PRODUCT_SALE_ORDER           // Venta de productos
  PRODUCT_PURCHASE_ORDER       // Compra de productos
  MEDICAL_APPOINTMENT_ORDER    // Cita médica
  MEDICAL_PRESCRIPTION_ORDER   // Receta médica
}

enum OrderStatus {
  PENDING      // Pendiente de pago
  PAID         // Pagada
  CANCELLED    // Cancelada
  REFUNDED     // Reembolsada
}
```

#### **Métodos de Pago**
```typescript
enum PaymentMethod {
  CASH         // Efectivo
  CARD         // Tarjeta
  TRANSFER     // Transferencia
  CHECK        // Cheque
  MOBILE       // Pago móvil
}
```

### **DTOs de Entrada**

#### **Cita Médica**
```typescript
interface CreateMedicalAppointmentBillingDto {
  appointmentId: string;
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
  currency?: string;
  voucherNumber?: string;
  notes?: string;
  metadata?: Record<string, any>;
}
```

#### **Receta Médica**
```typescript
interface CreateMedicalPrescriptionBillingDto {
  appointmentIds: string[];
  products: PrescriptionProductItemDto[];
  patientId: string;
  recipeId: string;
  branchId: string;
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
  currency?: string;
  voucherNumber?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

interface PrescriptionProductItemDto {
  productId: string;
  quantity: number;
  storageId: string;
}
```

#### **Venta de Productos**
```typescript
interface CreateProductSaleBillingDto {
  products: ProductSaleItemDto[];
  branchId: string;
  patientId: string;
  storageLocation?: string;
  batchNumber?: string;
  referenceId?: string;
  currency?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  metadata?: Record<string, any>;
}

interface ProductSaleItemDto {
  productId: string;
  quantity: number;
  storageId: string;
}
```

## 🚀 Casos de Uso (Use Cases)

### **1. CreateAppointmentOrderUseCase**
**Propósito**: Crear orden de facturación para cita médica
**Responsabilidades**:
- Validar que la cita existe y está en estado PENDING
- Obtener precio del servicio médico
- Calcular impuestos y totales
- Crear orden y pago pendiente
- Actualizar metadata con información del paciente

**Flujo**:
1. Validar cita médica
2. Obtener información del paciente
3. Calcular precio del servicio
4. Generar metadata enriquecida
5. Crear orden de facturación
6. Crear pago pendiente
7. Registrar auditoría

### **2. CreateMedicalPrescriptionUseCase**
**Propósito**: Crear orden de facturación para receta médica
**Responsabilidades**:
- Validar disponibilidad de productos en inventario
- Calcular totales de productos y servicios
- Crear orden combinada (productos + citas)
- Actualizar citas con referencia a la orden

**Flujo**:
1. Validar paciente y citas
2. Verificar stock de productos
3. Calcular totales de productos
4. Calcular totales de citas médicas
5. Combinar totales y crear orden
6. Crear pago pendiente
7. Actualizar citas con orderId

### **3. CreateProductSaleOrderUseCase**
**Propósito**: Crear orden de facturación para venta de productos
**Responsabilidades**:
- Validar disponibilidad de stock
- Calcular precios y totales
- Crear orden de venta
- Generar metadata con información del paciente

**Flujo**:
1. Validar paciente
2. Verificar stock disponible
3. Calcular precios y totales
4. Generar metadata
5. Crear orden de venta
6. Crear pago pendiente
7. Registrar auditoría

### **4. CreateProductPurchaseOrderUseCase**
**Propósito**: Crear orden de facturación para compra de productos
**Responsabilidades**:
- Validar productos y proveedor
- Calcular totales de compra
- Crear orden de compra
- Generar movimiento de inventario

**Estado**: Comentado/En desarrollo

## 📡 Endpoints API

### **POST /api/v1/billing/medical-appointment**
**Crear orden de cita médica**
```typescript
Body: CreateMedicalAppointmentBillingDto
Response: BaseApiResponse<AppointmentOrder>
```

**Validaciones**:
- `appointmentId`: Cita válida y en estado PENDING
- `paymentMethod`: Método de pago válido
- `currency`: Moneda válida (default: PEN)

### **POST /api/v1/billing/medical-prescription**
**Crear orden de receta médica**
```typescript
Body: CreateMedicalPrescriptionBillingDto
Response: BaseApiResponse<PrescriptionOrder>
```

**Validaciones**:
- `appointmentIds`: Citas válidas
- `products`: Productos con stock disponible
- `patientId`: Paciente válido
- `recipeId`: Receta válida

### **POST /api/v1/billing/product-sale**
**Crear orden de venta de productos**
```typescript
Body: CreateProductSaleBillingDto
Response: BaseApiResponse<ProductSaleOrder>
```

**Validaciones**:
- `products`: Productos con stock suficiente
- `patientId`: Paciente válido
- `branchId`: Sucursal válida

### **POST /api/v1/billing/product-purchase**
**Crear orden de compra de productos**
```typescript
Body: CreateProductPurchaseBillingDto
Response: BaseApiResponse<Order>
```

**Estado**: Comentado/En desarrollo

## 🔒 Seguridad y Autorización

### **Decoradores de Autenticación**
```typescript
@Auth()                    // Requiere autenticación
@GetUser() user: UserData  // Obtiene datos del usuario
```

### **Validaciones de Permisos**
- Solo personal autorizado puede crear órdenes
- Validación por sucursal del usuario
- Auditoría de todas las transacciones

## 🔄 Eventos y Notificaciones

### **Eventos del Sistema**
```typescript
// Al crear orden
OrderCreatedEvent {
  orderId: string;
  orderType: OrderType;
  total: number;
  patientId?: string;
  branchId: string;
}

// Al procesar pago
PaymentProcessedEvent {
  orderId: string;
  paymentId: string;
  amount: number;
  status: PaymentStatus;
}
```

### **Integración con Otros Módulos**
- **PayModule**: Creación de pagos pendientes
- **InventoryModule**: Verificación de stock
- **AppointmentsModule**: Validación de citas
- **PacientModule**: Información de pacientes

## 📊 Validaciones de Negocio

### **Reglas de Facturación**
1. **Citas Médicas**: Solo citas en estado PENDING pueden generar órdenes
2. **Stock**: Verificar disponibilidad antes de crear órdenes
3. **Precios**: Calcular impuestos (18% IGV) automáticamente
4. **Pacientes**: Validar que el paciente existe y está activo
5. **Sucursales**: Validar que la sucursal existe y está activa

### **Validaciones de Datos**
```typescript
// Ejemplo de validación en DTO
@IsUUID()
appointmentId: string;

@IsEnum(PaymentMethod)
@IsOptional()
paymentMethod?: PaymentMethod;

@IsNumber()
@IsOptional()
amountPaid?: number;

@IsString()
@IsOptional()
currency?: string;
```

## 🗄️ Acceso a Datos

### **Repository Pattern**
```typescript
class OrderRepository {
  async create(data: CreateOrderData): Promise<Order>
  async findById(id: string): Promise<Order | null>
  async update(id: string, data: UpdateOrderData): Promise<Order>
  async delete(id: string): Promise<void>
  async transaction<T>(fn: () => Promise<T>): Promise<T>
}
```

### **Queries Principales**
- Búsqueda de órdenes por tipo y estado
- Consulta de órdenes por paciente
- Filtros por rango de fechas
- Estadísticas de facturación

## 🧪 Testing

### **Tipos de Tests Requeridos**
1. **Unit Tests**: Casos de uso individuales
2. **Integration Tests**: Flujo completo de facturación
3. **E2E Tests**: Endpoints completos
4. **Repository Tests**: Acceso a datos

### **Casos de Prueba Críticos**
- Creación de orden de cita médica
- Creación de orden de receta con productos
- Validación de stock insuficiente
- Cálculo correcto de impuestos
- Integración con sistema de pagos

## 🔧 Configuración

### **Variables de Entorno**
```env
# Configuración de facturación
BILLING_DEFAULT_CURRENCY=PEN
BILLING_TAX_RATE=0.18
BILLING_DEFAULT_PAYMENT_METHOD=CASH

# Configuración de impuestos
IGV_RATE=0.18
IGV_DESCRIPTION=IGV 18%

# Configuración de monedas
SUPPORTED_CURRENCIES=PEN,USD,EUR
```

### **Configuración del Módulo**
```typescript
@Module({
  imports: [
    PayModule,
    InventoryModule,
    AuditModule,
    ServiceModule,
    AppointmentsModule,
    PacientModule,
  ],
  controllers: [BillingController],
  providers: [
    // Generators
    ProductSaleGenerator,
    MedicalPrescriptionGenerator,
    AppointmentGenerator,
    
    // Services
    BillingService,
    StockService,
    
    // Use Cases
    CreateProductSaleOrderUseCase,
    CreateMedicalPrescriptionUseCase,
    CreateAppointmentOrderUseCase,
    
    // Repositories
    StorageRepository,
  ],
  exports: [BillingService],
})
```

## 📈 Métricas y Monitoreo

### **Métricas Clave**
- Total de órdenes generadas por tipo
- Ingresos por período
- Productos más vendidos
- Tasa de conversión de citas a órdenes
- Tiempo promedio de pago

### **Logs Importantes**
- Creación de órdenes
- Errores de validación de stock
- Pagos procesados
- Auditoría de transacciones

## 🚨 Manejo de Errores

### **Errores Específicos**
```typescript
class InsufficientStockError extends Error {
  constructor(productId: string, required: number, available: number) {
    super(`Stock insuficiente para producto ${productId}. Requerido: ${required}, Disponible: ${available}`);
  }
}

class InvalidAppointmentStatusError extends Error {
  constructor(appointmentId: string, currentStatus: string) {
    super(`Cita ${appointmentId} no puede generar orden. Estado actual: ${currentStatus}`);
  }
}

class PatientNotFoundError extends Error {
  constructor(patientId: string) {
    super(`Paciente no encontrado: ${patientId}`);
  }
}
```

### **Códigos de Error**
- `400`: Datos de entrada inválidos
- `404`: Cita/paciente/producto no encontrado
- `409`: Stock insuficiente
- `422`: Estado de cita no permite facturación
- `500`: Error interno del servidor

## 🔄 Generadores de Órdenes

### **AppointmentGenerator**
**Propósito**: Generar órdenes para citas médicas
**Funcionalidades**:
- Calcular precio del servicio
- Generar metadata del paciente
- Crear código único de orden

### **MedicalPrescriptionGenerator**
**Propósito**: Generar órdenes para recetas médicas
**Funcionalidades**:
- Combinar productos y servicios
- Calcular totales mixtos
- Generar metadata completa

### **ProductSaleGenerator**
**Propósito**: Generar órdenes para ventas de productos
**Funcionalidades**:
- Validar productos
- Calcular totales con impuestos
- Generar metadata de venta

### **ProductPurchaseGenerator**
**Propósito**: Generar órdenes para compras de productos
**Funcionalidades**:
- Validar proveedores
- Calcular totales de compra
- Generar metadata de compra

**Estado**: Comentado/En desarrollo

## 📊 Metadata de Órdenes

### **Estructura de Metadata**
```typescript
interface OrderMetadata {
  patientDetails: {
    fullName: string;
    dni?: string;
    address?: string;
    phone?: string;
  };
  orderDetails: {
    transactionType: 'SALE' | 'PURCHASE' | 'MEDICAL_APPOINTMENT' | 'PRESCRIPTION';
    branchId: string;
    products?: ProductMovement[];
    services?: BaseServiceItem[];
    transactionDetails: {
      subtotal: number;
      tax: number;
      total: number;
    };
  };
}
```

### **Tipos de Metadata**
- **ProductSaleMetadata**: Venta de productos
- **ProductPurchaseMetadata**: Compra de productos
- **MedicalAppointmentMetadata**: Citas médicas
- **MedicalPrescriptionMetadata**: Recetas médicas

---

*Documentación del módulo Billing - Sistema API Juan Pablo II*
