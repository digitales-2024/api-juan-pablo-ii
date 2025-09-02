# 💳 Módulo Pay - Documentación Técnica

## 🎯 Descripción General

El módulo **Pay** gestiona el ciclo completo de **órdenes** y **pagos** del sistema. Provee CRUD, estados, validaciones de negocio, eventos de dominio, operaciones en lote y auditoría. Integra con otros módulos (p. ej. Billing) mediante generadores de órdenes y con auditoría del sistema para trazabilidad.

## 🏗️ Arquitectura del Módulo

### Estructura de Directorios
```
📁 libs/pay/
├── 📁 controllers/                 # Controladores REST (Order y Payment)
├── 📁 entities/                    # Entidades (Swagger models)
├── 📁 errors/                      # Mensajes de error
├── 📁 events/                      # Eventos de dominio (OrderEvents)
├── 📁 generators/                  # Generadores base de órdenes
├── 📁 interfaces/                  # Tipados, enums y DTOs
├── 📁 repositories/                # Acceso a datos (PayBaseRepository)
├── 📁 services/                    # Lógica de negocio (OrderService, PaymentService)
├── 📁 use-cases/                   # Casos de uso (ordenes y pagos)
├── 📁 utils/                       # Utilidades (cálculos de pagos)
├── pay.module.ts                   # Configuración del módulo
└── README.md                       # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture + Repository Pattern
- Casos de uso por operación (crear, actualizar, cancelar, reembolsar, etc.)
- Auditoría con `AuditModule`
- Enums y DTOs fuertemente tipados (TypeScript)
- Event-Driven con `@nestjs/event-emitter`

## 🔧 Dependencias del Módulo

### Internas
```typescript
@Module({
  imports: [AuditModule],
  controllers: [OrderController, PaymentController],
  providers: [
    // Services
    OrderService,
    PaymentService,
    // Repositories
    OrderRepository,
    PaymentRepository,
    // Use cases - Orders
    CreateOrderUseCase,
    UpdateOrderUseCase,
    DeleteOrdersUseCase,
    ReactivateOrdersUseCase,
    FindOrdersByStatusUseCase,
    SubmitDraftOrderUseCase,
    CompleteOrderUseCase,
    CancelOrderUseCase,
    RefundOrderUseCase,
    // Use cases - Payments
    CreatePaymentUseCase,
    UpdatePaymentUseCase,
    DeletePaymentsUseCase,
    ReactivatePaymentsUseCase,
    ProcessPaymentUseCase,
    VerifyPaymentUseCase,
    RejectPaymentUseCase,
    CancelPaymentUseCase,
    FindPaymentsByStatusUseCase,
    RefundPaymentUseCase,
  ],
  exports: [OrderService, PaymentService, OrderRepository, PaymentRepository],
})
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@nestjs/event-emitter`
- `class-validator`, `class-transformer`
- `@prisma/client` (vía `PrismaService`)

## 📊 Modelos de Datos y Enums

### Entidad: `Order`
Campos clave: `id`, `code`, `type`, `movementTypeId`, `referenceId`, `sourceId`, `targetId`, `status`, `currency`, `subtotal`, `tax`, `total`, `date`, `notes`, `metadata`, `isActive`.

- `OrderType`: `MEDICAL_PRESCRIPTION_ORDER`, `MEDICAL_APPOINTMENT_ORDER`, `PRODUCT_SALE_ORDER`, `PRODUCT_PURCHASE_ORDER`
- `OrderStatus`: `DRAFT`, `PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`, `REFUNDED`, `REQUIRES_ATTENTION`

Extensiones:
- `DetailedOrder`: `Order` + `payments: Payment[]`
- `AppointmentOrder`, `ProductSaleOrder`, `PrescriptionOrder`: tipan `metadata` según metadatos del módulo Billing

### Entidad: `Payment`
Campos: `id`, `orderId`, `date`, `status`, `type`, `amount`, `description`, `paymentMethod`, `voucherNumber`, `verifiedBy`, `verifiedAt`, `isActive`, `createdAt`, `updatedAt`.

- `PaymentStatus`: `PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`, `REFUNDED`
- `PaymentType`: `REGULAR`, `REFUND`, `PARTIAL_PAYMENT`, `ADJUSTMENT`, `COMPENSATION`
- `PaymentMethod`: `CASH`, `BANK_TRANSFER`, `DIGITAL_WALLET`

## 🧾 Tipados (Interfaces, Enums y DTOs)

### Interfaces base

Origen: `libs/pay/src/interfaces/order.interface.ts`

```typescript
export interface IOrder {
  code?: string;
  type: OrderType;
  movementTypeId: string;
  referenceId: string;
  sourceId?: string;
  targetId?: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  date: Date;
  dueDate?: Date;
  notes?: string;
  metadata?: string; // JSON stringificado
}

export interface IOrderGenerator {
  type: OrderType;
  canHandle(type: OrderType): boolean;
  generate(input: any): Promise<IOrder>;
  calculateTotal(input: any): Promise<number>;
  calculateTax(subtotal: number): Promise<number>;
}
```

### Enums

Origen: `libs/pay/src/interfaces/order.types.ts`, `libs/pay/src/interfaces/payment.types.ts`

```typescript
// Order
export enum OrderStatus {
  DRAFT = 'DRAFT', PENDING = 'PENDING', PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED', REFUNDED = 'REFUNDED',
  REQUIRES_ATTENTION = 'REQUIRES_ATTENTION',
}
export enum OrderType {
  MEDICAL_PRESCRIPTION_ORDER = 'MEDICAL_PRESCRIPTION_ORDER',
  MEDICAL_APPOINTMENT_ORDER = 'MEDICAL_APPOINTMENT_ORDER',
  PRODUCT_SALE_ORDER = 'PRODUCT_SALE_ORDER',
  PRODUCT_PURCHASE_ORDER = 'PRODUCT_PURCHASE_ORDER',
}

// Payment
export enum PaymentStatus { PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED }
export enum PaymentMethod { CASH, BANK_TRANSFER, DIGITAL_WALLET }
export enum PaymentType { REGULAR, REFUND, PARTIAL_PAYMENT, ADJUSTMENT, COMPENSATION }
```

### DTOs - Ordenes

Origen: `libs/pay/src/interfaces/dto/order/*.ts`

```typescript
// create-order.dto.ts
export class CreateOrderDto {
  code?: string; type: OrderType; movementTypeId: string; referenceId: string;
  sourceId?: string; targetId?: string; status: OrderStatus; currency: string;
  subtotal: number; tax: number; total: number; notes?: string; metadata?: string;
}

// update-order.dto.ts
export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

// delete-order.dto.ts
export class DeleteOrdersDto { ids: string[] }

// submit-draft-order.dto.ts
export class SubmitDraftOrderDto { notes?: string }
```

### DTOs - Pagos

Origen: `libs/pay/src/interfaces/dto/payment/*.ts`

```typescript
export class CreatePaymentDto {
  orderId: string; date?: Date; status?: PaymentStatus; type: PaymentType;
  amount: number; description?: string; paymentMethod?: PaymentMethod;
  voucherNumber?: string; originalPaymentId?: string;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  status: PaymentStatus; amount?: number; description?: string;
}

export class DeletePaymentsDto { ids: string[] }
export class ProcessPaymentDto {
  paymentMethod: PaymentMethod; amount: number; voucherNumber?: string; date: Date; description?: string;
}
export class VerifyPaymentDto { verificationNotes?: string; verifiedAt?: Date }
export class RejectPaymentDto { rejectionReason: string }
export class CancelPaymentDto { cancellationReason: string }
export class RefundPaymentDto {
  amount: number; reason: string; refundMethod: PaymentMethod; notes?: string;
}
```

### Entidades (Swagger Models)

Origen: `libs/pay/src/entities/*.ts`

```typescript
class Order { id: string; code?: string; type: OrderType; status: OrderStatus; currency: string;
  subtotal: number; tax: number; total: number; date: Date; notes?: string; metadata?: string; isActive: boolean; }
class DetailedOrder extends Order { payments: Payment[] }
class Payment { id: string; orderId: string; date: Date; status: PaymentStatus; type: PaymentType; amount: number;
  paymentMethod?: PaymentMethod; voucherNumber?: string; verifiedBy?: string; verifiedAt?: Date; isActive: boolean }
```

### Tipos de metadatos (integración con Billing)

Origen: `src/modules/billing/interfaces/metadata.interfaces.ts`

```typescript
// Metadata tipada según el tipo de orden
type MedicalAppointmentMetadata = { /* patientDetails, orderDetails, transactionDetails */ };
type ProductSaleMetadata = { /* patientDetails, products, transactionDetails */ };
type MedicalPrescriptionMetadata = { /* products, services, transactionDetails */ };
```

## 🧱 Repositories y Acceso a Datos

### `PayBaseRepository<T>`
- Extiende `BaseRepository<T>` y ajusta mapping de enums `OrderType`/`OrderStatus`
- Serializa `metadata`, `details`, `services` a JSON string
- Helpers: `findByPaymentStatus`, `findByOrderType`, `findByReference`

### `OrderRepository` y `PaymentRepository`
- CRUD, soft-delete/reactivate en lote, `findManyActive`
- `PaymentRepository.findByStatus(status)` y `OrderRepository` con includes para `payments`

Todas las operaciones críticas usan `transaction(...)` con auditoría.

## 🧠 Generadores de Órdenes

### `BaseOrderGenerator`
- Contrato para generadores: `type`, `canHandle`, `generate`, `calculateTotal`, `calculateTax`, `calculateTotals`, `generateCode`
- Se registran desde otros módulos (p.ej. Billing) en `OrderService.registerGenerator(...)`

Uso típico (desde Billing): generar orden para cita/receta/venta y registrar el generador en `OrderService`.

## 🚀 Casos de Uso

### Órdenes
- `CreateOrderUseCase` — Crea orden (DRAFT/PENDING...), audita
- `UpdateOrderUseCase` — Actualiza datos de orden, audita
- `DeleteOrdersUseCase` — Soft delete en lote, audita
- `ReactivateOrdersUseCase` — Reactiva en lote, audita
- `FindOrdersByStatusUseCase` — Lista por estado
- `SubmitDraftOrderUseCase` — DRAFT → PENDING, crea pago PENDING asociado
- `CompleteOrderUseCase` — COMPLETED + emite eventos por tipo
- `CancelOrderUseCase` — CANCELLED + cancela pagos PENDING/PROCESSING + evento
- `RefundOrderUseCase` — REFUNDED + marca pagos COMPLETED como REFUNDED + evento

### Pagos
- `CreatePaymentUseCase` — Crea pago (por defecto PENDING), audita
- `UpdatePaymentUseCase` — Actualiza parcial (monto, estado, descripción), audita
- `DeletePaymentsUseCase` — Soft delete en lote, audita
- `ReactivatePaymentsUseCase` — Reactiva en lote, audita
- `ProcessPaymentUseCase` — Valida método/comprobante/montos, pasa a PROCESSING
- `VerifyPaymentUseCase` — PROCESSING → COMPLETED, actualiza orden a COMPLETED + evento
- `RejectPaymentUseCase` — PROCESSING → CANCELLED, orden → CANCELLED + evento
- `CancelPaymentUseCase` — PENDING → CANCELLED, orden → CANCELLED + evento
- `RefundPaymentUseCase` — Crea registro REFUND (monto negativo), orden → REFUNDED
- `FindPaymentsByStatusUseCase` — Filtro por `status` y opcional `type`, retorna estadísticas por tipo

## 📡 Endpoints API

### Ordenes (`/api/v1/order`)
- `POST /` — Crear orden — Body: `CreateOrderDto` — Respuesta: `BaseApiResponse<Order>`
- `GET /` — Listar (filtra por sucursal según usuario) — Respuesta: `DetailedOrder[]`
- `GET /active` — Listar activas — Respuesta: `Order[]`
- `GET /type/:type` — Listar por tipo — Respuesta: `Order[]`
- `GET /status/:status` — Listar por estado — Respuesta: `Order[]`
- `GET /detailed/:id` — Obtener detallada por id — Respuesta: `DetailedOrder`
- `GET /detailed/code/:code` — Obtener detallada por código — Respuesta: `DetailedOrder`
- `GET /search/detailed/code/:code` — Buscar por código (contains) — Respuesta: `DetailedOrder[]`
- `PATCH /:id` — Actualizar — Body: `UpdateOrderDto` — Respuesta: `BaseApiResponse<Order>`
- `DELETE /remove/all` — Desactivar múltiples — Body: `DeleteOrdersDto` — Respuesta: `BaseApiResponse<Order[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeleteOrdersDto` — Respuesta: `BaseApiResponse<Order[]>`
- `POST /:id/submit-draft` — Confirmar borrador (DRAFT → PENDING) y crear pago — Body: `SubmitDraftOrderDto`
- `POST /:id/complete` — Completar orden — Respuesta: `BaseApiResponse<Order>`
- `POST /:id/cancel` — Cancelar orden (y pagos PENDING/PROCESSING)
- `POST /:id/refund` — Reembolsar orden (requiere pagos COMPLETED)

### Pagos (`/api/v1/payment`)
- `POST /` — Crear pago — Body: `CreatePaymentDto` — Respuesta: `BaseApiResponse<Payment>`
- `GET /` — Listar pagos — Respuesta: `Payment[]`
- `GET /status/:status?type=...` — Listar por estado y opcional tipo — Respuesta: `{ payments, typeStats }`
- `GET /:id` — Obtener por id — Respuesta: `Payment`
- `PATCH /:id` — Actualizar parcial — Body: `UpdatePaymentDto`
- `DELETE /remove/all` — Desactivar múltiples — Body: `DeletePaymentsDto`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `{ ids: string[] }`
- `POST /:id/process` — Procesar pago (PENDING → PROCESSING) — Body: `ProcessPaymentDto`
- `POST /:id/verify` — Verificar pago (PROCESSING → COMPLETED) — Body: `VerifyPaymentDto`
- `POST /:id/reject` — Rechazar pago (PROCESSING → CANCELLED) — Body: `RejectPaymentDto`
- `POST /:id/cancel` — Cancelar pago (PENDING → CANCELLED) — Body: `CancelPaymentDto`
- `POST /:id/refund` — Reembolsar pago — Body: `RefundPaymentDto`

## 🔒 Seguridad y Autorización
- Decoradores: `@Auth()`, `@GetUser()`, `@GetUserBranch()`
- Filtro por sucursal en listados de órdenes para roles administrativos
- Auditoría en todas las operaciones de cambio de estado/creación

## 🔄 Eventos de Dominio
- Enum `OrderEvents`: `order.completed`, `order.cancelled`, `order.failed`, `order.requires_attention`
- Emisión en casos de uso: completar, cancelar, reembolsar, verificar/rechazar pagos
- Payloads incluyen `order` y `metadata` contextual (p. ej., `paymentId`, razón, fechas)

## 📏 Reglas y Validaciones de Negocio
- Orden DRAFT solo puede pasar a PENDING vía submit; luego a COMPLETED/CANCELLED/REFUNDED según flujo
- `RefundOrderUseCase`: requiere orden COMPLETED y pagos COMPLETED asociados
- `ProcessPaymentUseCase`: si método != CASH, requiere `voucherNumber`; valida monto contra `order.total`
- `VerifyPaymentUseCase`: PAYMENT PROCESSING → COMPLETED y orden → COMPLETED
- `Reject/Cancel Payment`: estados válidos y propagación de estado a la orden
- Reembolsos registran un pago adicional de tipo REFUND con monto negativo

## 🧮 Utilidades
- `PaymentCalculations`: totales por tipo, montos netos y métricas por tipo (`getPaymentStats*`)

## 🧪 Testing Recomendado
- Unit: casos de uso de cambio de estado (órdenes y pagos), validaciones de monto/método
- Integration: repositorios con Prisma y transacciones/soft-delete
- E2E: endpoints de órdenes y pagos incluyendo escenarios de eventos

## 🚨 Manejo de Errores
- Centralizado con `BaseErrorHandler`
- Mensajes específicos:
  - `orderErrorMessages`: `notFound`, `invalidStatus`, `generatorNotFound`, etc.
  - `paymentErrorMessages`: `duplicatePayment`, `invalidAmount`, `paymentAlreadyProcessed`, etc.
- Códigos comunes: 400, 404, 409, 422, 500

## 🔧 Configuración (opcional)
Variables sugeridas si se parametrizan reglas:
```env
ORDER_DEFAULT_CURRENCY=PEN
PAY_TAX_RATE=0.18
PAYMENT_REQUIRE_VOUCHER_FOR_NONCASH=true
```

## 🔗 Integraciones
- Billing: registra generadores de órdenes (citas, recetas, ventas) y consume `OrderService`
- Inventory/Calendar: indirectas vía metadatos y flujos de negocio
- Audit: auditoría en todas las operaciones críticas

---

Documentación del módulo Pay - Sistema API Juan Pablo II
