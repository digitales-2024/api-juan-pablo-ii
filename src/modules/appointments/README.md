# 📋 Módulo Appointments - Documentación Técnica

## 🎯 Descripción General

El módulo **Appointments** es el núcleo del sistema de gestión de citas médicas. Maneja todo el ciclo de vida de una cita, desde su creación hasta su finalización, incluyendo reprogramaciones, cancelaciones y reembolsos.

## 🏗️ Arquitectura del Módulo

### **Estructura de Directorios**
```
📁 appointments/
├── 📁 controllers/          # Controladores REST
├── 📁 dto/                 # Data Transfer Objects
├── 📁 entities/            # Entidades del dominio
├── 📁 errors/              # Manejo de errores específicos
├── 📁 events/              # Eventos del módulo
├── 📁 repositories/        # Capa de acceso a datos
├── 📁 services/            # Lógica de negocio
├── 📁 use-cases/           # Casos de uso específicos
├── appointments.module.ts  # Configuración del módulo
└── README.md              # Esta documentación
```

### **Patrón Arquitectónico**
- **Clean Architecture** con separación de responsabilidades
- **Use Cases** para operaciones específicas
- **Repository Pattern** para acceso a datos
- **Event-Driven** para comunicación entre módulos

## 🔧 Dependencias del Módulo

### **Módulos Internos**
```typescript
imports: [
  AuditModule,           // Auditoría de acciones
  EventsModule,          // Gestión de eventos del calendario
  ServiceModule,         // Servicios médicos
  InventoryModule,       // Control de inventario
  PayModule,            // Sistema de pagos
]
```

### **Dependencias Externas**
- `@nestjs/common` - Decoradores y utilidades
- `@nestjs/swagger` - Documentación API
- `@prisma/client` - Tipos de base de datos
- `class-validator` - Validación de datos
- `class-transformer` - Transformación de datos

## 📊 Modelos de Datos

### **Entidad Principal: Appointment**
```typescript
interface Appointment {
  id: string;
  eventId?: string;
  staffId: string;
  serviceId: string;
  branchId: string;
  patientId: string;
  start: DateTime;
  end: DateTime;
  paymentMethod: PaymentMethod;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  cancellationReason?: string;
  noShowReason?: string;
  rescheduledFromId?: string;
  orderId?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### **Enums Utilizados**
```typescript
enum AppointmentStatus {
  PENDING      // Generada pero no pagada
  CONFIRMED    // Pagada y confirmada
  COMPLETED    // Cita completada
  CANCELLED    // Cancelada
  NO_SHOW      // Paciente no asistió
  RESCHEDULED  // Reprogramada
}

enum AppointmentType {
  CONSULTA     // Consulta médica
  OTRO         // Otro tipo
}

enum PaymentMethod {
  CASH         // Efectivo
  CARD         // Tarjeta
  TRANSFER     // Transferencia
  // ... otros métodos
}
```

## 🚀 Casos de Uso (Use Cases)

### **1. CreateAppointmentUseCase**
**Propósito**: Crear una nueva cita médica
**Responsabilidades**:
- Validar disponibilidad del médico
- Verificar conflictos de horarios
- Crear evento en calendario
- Generar orden de pago
- Emitir eventos de notificación

**Dependencias**:
- `AppointmentRepository`
- `EventService`
- `OrderService`
- `NotificationService`

### **2. UpdateAppointmentUseCase**
**Propósito**: Actualizar datos de una cita existente
**Validaciones**:
- Solo citas pendientes pueden ser modificadas
- Verificar permisos del usuario
- Validar nuevos horarios disponibles

### **3. CancelAppointmentUseCase**
**Propósito**: Cancelar una cita médica
**Flujo**:
1. Validar estado actual de la cita
2. Calcular reembolso si aplica
3. Cancelar evento del calendario
4. Actualizar inventario si es necesario
5. Emitir notificaciones

### **4. RescheduleAppointmentUseCase**
**Propósito**: Reprogramar una cita existente
**Lógica**:
- Crear nueva cita con nuevos horarios
- Marcar cita original como reprogramada
- Transferir pagos si es necesario
- Actualizar eventos del calendario

### **5. RefundAppointmentUseCase**
**Propósito**: Procesar reembolsos de citas canceladas
**Consideraciones**:
- Políticas de reembolso por tiempo
- Método de pago original
- Comisiones aplicables

## 📡 Endpoints API

### **POST /api/v1/appointments**
**Crear nueva cita**
```typescript
Body: CreateAppointmentDto
Response: HttpResponse<Appointment>
```

**Validaciones**:
- `staffId`: Personal médico válido y disponible
- `serviceId`: Servicio activo
- `branchId`: Sucursal válida
- `patientId`: Paciente registrado
- `start/end`: Horarios disponibles
- `paymentMethod`: Método de pago válido

### **GET /api/v1/appointments/paginated**
**Listar citas paginadas**
```typescript
Query: {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  staffId?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
}
```

### **PATCH /api/v1/appointments/:id**
**Actualizar cita**
```typescript
Body: UpdateAppointmentDto
Response: HttpResponse<Appointment>
```

### **DELETE /api/v1/appointments/:id**
**Cancelar cita**
```typescript
Body: CancelAppointmentDto
Response: HttpResponse<Appointment>
```

### **POST /api/v1/appointments/:id/reschedule**
**Reprogramar cita**
```typescript
Body: RescheduleAppointmentDto
Response: HttpResponse<Appointment>
```

### **POST /api/v1/appointments/:id/refund**
**Procesar reembolso**
```typescript
Body: RefundAppointmentDto
Response: HttpResponse<Appointment>
```

## 🔒 Seguridad y Autorización

### **Decoradores de Autenticación**
```typescript
@Auth()                    // Requiere autenticación
@GetUser() user: UserData  // Obtiene datos del usuario
@GetUserBranch() branch: UserBranchData  // Obtiene sucursal del usuario
```

### **Validaciones de Permisos**
- Solo personal médico puede crear/modificar citas
- Pacientes solo pueden ver sus propias citas
- Administradores tienen acceso completo
- Validación por sucursal del usuario

## 🔄 Eventos y Notificaciones

### **Eventos Emitidos**
```typescript
// Al crear cita
AppointmentCreatedEvent {
  appointmentId: string;
  patientId: string;
  staffId: string;
  start: DateTime;
}

// Al cancelar cita
AppointmentCancelledEvent {
  appointmentId: string;
  reason: string;
  refundAmount?: number;
}

// Al reprogramar cita
AppointmentRescheduledEvent {
  oldAppointmentId: string;
  newAppointmentId: string;
  reason: string;
}
```

### **Suscripciones a Eventos**
```typescript
@EventPattern('appointment.created')
@EventPattern('appointment.cancelled')
@EventPattern('appointment.rescheduled')
```

## 📊 Validaciones de Negocio

### **Reglas de Negocio**
1. **Disponibilidad**: Verificar que el médico esté disponible en el horario
2. **Conflictos**: No permitir citas solapadas para el mismo médico
3. **Anticipación**: Citas deben programarse con mínimo 24h de anticipación
4. **Duración**: Validar duración mínima y máxima según servicio
5. **Cancelación**: Políticas de cancelación según tiempo restante

### **Validaciones de Datos**
```typescript
// Ejemplo de validación en DTO
@IsDateString()
@IsNotEmpty()
start: string;

@IsString()
@IsNotEmpty()
staffId: string;

@IsEnum(AppointmentType)
type: AppointmentType;
```

## 🗄️ Acceso a Datos

### **Repository Pattern**
```typescript
class AppointmentRepository {
  async create(data: CreateAppointmentData): Promise<Appointment>
  async findById(id: string): Promise<Appointment | null>
  async findByStaffAndDate(staffId: string, date: Date): Promise<Appointment[]>
  async update(id: string, data: UpdateAppointmentData): Promise<Appointment>
  async delete(id: string): Promise<void>
  async findPaginated(filters: AppointmentFilters): Promise<PaginatedResult<Appointment>>
}
```

### **Queries Principales**
- Búsqueda por médico y fecha
- Filtros por estado y rango de fechas
- Consultas paginadas con múltiples filtros
- Búsqueda de conflictos de horarios

## 🧪 Testing

### **Tipos de Tests Requeridos**
1. **Unit Tests**: Casos de uso individuales
2. **Integration Tests**: Flujo completo de creación/cancelación
3. **E2E Tests**: Endpoints completos
4. **Repository Tests**: Acceso a datos

### **Casos de Prueba Críticos**
- Creación de cita con horario disponible
- Creación de cita con conflicto de horarios
- Cancelación de cita con reembolso
- Reprogramación de cita existente
- Validación de permisos por rol

## 🔧 Configuración

### **Variables de Entorno**
```env
# Configuración de citas
APPOINTMENT_MIN_ADVANCE_HOURS=24
APPOINTMENT_MAX_DURATION_HOURS=4
APPOINTMENT_CANCELLATION_WINDOW_HOURS=2

# Configuración de reembolsos
REFUND_POLICY_PERCENTAGE=80
REFUND_PROCESSING_DAYS=3
```

### **Configuración del Módulo**
```typescript
@Module({
  imports: [
    AuditModule,
    EventsModule,
    ServiceModule,
    InventoryModule,
    PayModule,
  ],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    AppointmentRepository,
    // ... todos los use cases
  ],
  exports: [AppointmentService],
})
```

## 📈 Métricas y Monitoreo

### **Métricas Clave**
- Tasa de citas completadas vs canceladas
- Tiempo promedio de reprogramación
- Satisfacción del paciente
- Utilización de horarios médicos

### **Logs Importantes**
- Creación de citas
- Cancelaciones y razones
- Reprogramaciones
- Errores de validación

## 🚨 Manejo de Errores

### **Errores Específicos**
```typescript
class AppointmentConflictError extends Error {
  constructor(message: string) {
    super(`Conflicto de cita: ${message}`);
  }
}

class InvalidAppointmentStatusError extends Error {
  constructor(currentStatus: AppointmentStatus, requiredStatus: AppointmentStatus[]) {
    super(`Estado inválido: ${currentStatus}. Requerido: ${requiredStatus.join(', ')}`);
  }
}
```

### **Códigos de Error**
- `400`: Datos de entrada inválidos
- `409`: Conflicto de horarios
- `403`: Sin permisos para la operación
- `404`: Cita no encontrada
- `422`: Estado de cita no permite la operación

---

*Documentación del módulo Appointments - Sistema API Juan Pablo II*
