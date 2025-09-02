# 🗓️ Módulo Staff Schedule - Documentación Técnica

## 🎯 Descripción General

El módulo **Staff Schedule** gestiona los horarios recurrentes del personal por sucursal. Permite crear, actualizar, listar, desactivar y reactivar horarios, incluyendo reglas de recurrencia (diaria, semanal, mensual, anual), días de la semana, excepciones de fechas y control de acceso por sucursal.

## 🏗️ Arquitectura del Módulo

### Estructura de Directorios
```
📁 staff-schedule/
├── 📁 controllers/                   # Controladores REST
├── 📁 dto/                           # Data Transfer Objects
├── 📁 entities/                      # Entidades del dominio
├── 📁 errors/                        # Mensajes de error del dominio
├── 📁 repositories/                  # Acceso a datos (Prisma BaseRepository)
├── 📁 services/                      # Lógica de negocio (coordinación de casos de uso)
├── 📁 strategies/                    # Estrategias de recurrencia (WIP)
├── 📁 use-cases/                     # Casos de uso (CU) del dominio
├── validators/                       # Validadores (WIP)
├── staff-schedule.module.ts          # Configuración del módulo
└── README.md                         # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture y Repository Pattern
- Casos de uso especializados por operación (crear, actualizar, filtrar, desactivar, reactivar)
- Integración con módulo de eventos (calendario) para mantener consistencia
- Auditoría de acciones (creación/actualización/desactivación/reactivación)

## 🔧 Dependencias del Módulo

### Internas
```typescript
@Module({
  imports: [
    AuditModule,
    forwardRef(() => EventsModule), // Para eliminar eventos cuando cambian horarios
  ],
  controllers: [StaffScheduleController],
  providers: [
    StaffScheduleService,
    StaffScheduleRepository,
    CreateStaffScheduleUseCase,
    UpdateStaffScheduleUseCase,
    DeleteStaffSchedulesUseCase,
    ReactivateStaffSchedulesUseCase,
    FindStaffSchedulesByFilterUseCase,
    DeleteEventsByStaffScheduleUseCase,
  ],
  exports: [StaffScheduleService],
})
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `class-validator`, `class-transformer`
- `@prisma/client` (tipos: `DayOfWeek`)
- Decoradores de autenticación desde `@login/login/admin/auth/decorators`

## 📊 Modelos de Datos y Tipados

### Entidad: `StaffSchedule`
```typescript
class StaffSchedule {
  id: string;
  staffId: string;     // Personal
  branchId: string;    // Sucursal
  title: string;       // Ej. "Turno Mañana"
  color: string;       // Ej. "sky"
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  daysOfWeek: $Enums.DayOfWeek[]; // Lunes..Domingo
  recurrence: {        // Reglas de recurrencia
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;  // >= 1
    until: string;     // YYYY-MM-DD
  };
  exceptions: string[]; // Fechas excluidas (YYYY-MM-DD)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### DTOs
- `CreateStaffScheduleDto`
- `UpdateStaffScheduleDto`
- `DeleteStaffSchedulesDto`
- `FindStaffSchedulesQueryDto`
- `RecurrenceDto`

Ejemplos relevantes:
```typescript
class RecurrenceDto {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;      // >= 1
  until: string;         // YYYY-MM-DD
}

class CreateStaffScheduleDto {
  staffId: string;
  branchId: string;
  title: string;
  color?: string;
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  daysOfWeek: DayOfWeek[];
  recurrence: RecurrenceDto;
  exceptions?: string[]; // YYYY-MM-DD
}

class UpdateStaffScheduleDto { /* todos opcionales */ }

class FindStaffSchedulesQueryDto {
  branchId?: string;
  staffId?: string;
}
```

Validaciones clave: `@IsEnum(DayOfWeek, { each: true })`, `@IsISO8601` para fechas, normalización con `@Transform` para strings.

## 🚀 Casos de Uso

- `CreateStaffScheduleUseCase`
  - Crea el horario con transacción y registra auditoría (CREATE).
- `UpdateStaffScheduleUseCase`
  - Elimina eventos asociados en calendario y actualiza el horario; audita (UPDATE).
- `DeleteStaffSchedulesUseCase`
  - Desactivación múltiple (soft-delete) y auditoría (DELETE) por cada ID.
- `ReactivateStaffSchedulesUseCase`
  - Reactivación múltiple y auditoría (UPDATE) por cada ID.
- `FindStaffSchedulesByFilterUseCase`
  - Filtra por `staffId` y/o `branchId` y retorna con relaciones básicas (staff y branch).

Notas:
- `Service` verifica cambios con `validateChanges` antes de escribir.
- Filtro por sucursal según rol del usuario (`GetUserBranch`), permitiendo visibilidad restringida.

## 📡 Endpoints API

Base: `/api/v1/staff-schedule`

- `POST /` — Crear horario
  - Body: `CreateStaffScheduleDto`
  - Respuesta: `BaseApiResponse<StaffSchedule>`
- `GET /` — Listar todos (con filtro por sucursal si aplica)
  - Respuesta: `StaffSchedule[]`
- `GET /filter` — Filtrar por criterios
  - Query: `branchId?`, `staffId?`
  - Respuesta: `StaffSchedule[]`
- `GET /:id` — Obtener por ID
  - Respuesta: `StaffSchedule`
- `PATCH /:id` — Actualizar
  - Body: `UpdateStaffScheduleDto`
  - Respuesta: `BaseApiResponse<StaffSchedule>`
- `DELETE /remove/all` — Desactivar múltiples
  - Body: `DeleteStaffSchedulesDto { ids: string[] }`
  - Respuesta: `BaseApiResponse<StaffSchedule[]>`
- `PATCH /reactivate/all` — Reactivar múltiples
  - Body: `DeleteStaffSchedulesDto { ids: string[] }`
  - Respuesta: `BaseApiResponse<StaffSchedule[]>`

## 🔒 Seguridad y Autorización
- Decoradores: `@Auth()`, `@GetUser()`, `@GetUserBranch()`
- Control por rol/sucursal en `StaffScheduleService` (filtro dinámico por `branchId`).
- Auditoría completa vía `AuditModule`.

## 🔄 Integraciones y Eventos
- Integración con `Calendar/Events`:
  - En actualización, `UpdateStaffScheduleUseCase` ejecuta `DeleteEventsByStaffScheduleUseCase` para limpiar eventos derivados del horario anterior y evitar inconsistencias.

## 📏 Reglas y Validaciones de Negocio
- `startTime < endTime` (recomendado validar a nivel de DTO/servicio)
- `daysOfWeek` debe contener al menos un día válido
- `recurrence.interval >= 1` y `recurrence.until` con formato `YYYY-MM-DD`
- No se permite solapamiento de horarios para el mismo `staffId` (recomendado validar según requerimiento)
- Soft delete: no elimina físicamente, usa `isActive` y operaciones en lote

## 🗄️ Acceso a Datos

Repositorio: `StaffScheduleRepository` (extiende `BaseRepository`)
- `findStaffScheduleById(id)` — con relaciones (nombre del staff y de la sucursal), lanza `BadRequestException` si no existe
- `findWithRelations(params)` — lista con filtros y relaciones; fuerza `isActive: true`
- Operaciones en lote: `reactivateMany(ids)`, `deleteMany(ids)`
- Transacciones: `transaction(fn)` para operaciones atómicas con auditoría

## 🧪 Testing Recomendado
- Unit: Casos de uso (creación, actualización con limpieza de eventos, filtros, desactivar/reactivar)
- Integration: Controlador + servicio con filtros por sucursal/rol
- E2E: Flujo completo (crear → generar eventos externos → actualizar → verificar limpieza)

## 🔧 Configuración
Variables sugeridas (si deseas parametrizar reglas):
```env
STAFF_SCHEDULE_DEFAULT_COLOR=sky
STAFF_SCHEDULE_MAX_INTERVAL=52
```

## 📈 Métricas y Monitoreo
- Número de horarios por sucursal y por staff
- Tiempo promedio de respuesta de filtros
- Porcentaje de operaciones en lote
- Errores de validación (fechas, horas, días de semana)

## 🚨 Manejo de Errores
Mensajes centralizados en `errors-staff-schedule.ts`:
- `notFound`, `alreadyExists`, `invalidData`, `notActive`, `alreadyActive`, `inUse`, `invalidOperation`

Errores típicos:
- 400: Datos inválidos (fechas/horas/días)
- 404: Horario no encontrado
- 409: Conflictos de negocio (solapamientos, en uso)
- 500: Error interno

## 🧾 Tipados y Transformaciones
- `DayOfWeek` desde `@prisma/client`
- Fechas ISO 8601 con `@IsISO8601`
- Normalización de strings con `@Transform`
- DTOs con `class-validator` y `class-transformer`

---

Documentación del módulo Staff Schedule - Sistema API Juan Pablo II
