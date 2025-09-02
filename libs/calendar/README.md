# 📅 Módulo Calendar - Documentación Técnica

## 🎯 Descripción General

El módulo **Calendar** gestiona el **sistema de calendario** completo del centro médico, incluyendo eventos, ausencias temporales y utilidades de recurrencia. Proporciona funcionalidades para programar turnos médicos, citas, ausencias del personal y eventos recurrentes. Integra con el sistema de auditoría y maneja eventos de dominio para sincronización con otros módulos.

## 🏗️ Arquitectura del Módulo

### Estructura de Directorios
```
📁 libs/calendar/
├── 📁 src/
│   ├── 📁 event/                    # Gestión de eventos del calendario
│   │   ├── 📁 controllers/          # Controladores REST
│   │   ├── 📁 dto/                 # Data Transfer Objects
│   │   ├── 📁 entities/            # Entidades (Swagger models)
│   │   ├── 📁 errors/              # Mensajes de error
│   │   ├── 📁 factories/           # Factories para creación de eventos
│   │   ├── 📁 observers/           # Observadores de eventos de dominio
│   │   ├── 📁 repositories/        # Acceso a datos
│   │   ├── 📁 scheduling/          # Lógica de programación
│   │   ├── 📁 services/            # Lógica de negocio
│   │   ├── 📁 use-cases/           # Casos de uso
│   │   ├── 📁 validators/          # Validadores
│   │   └── events.module.ts        # Configuración del módulo de eventos
│   ├── 📁 time-off/                # Gestión de ausencias temporales
│   │   ├── 📁 controllers/         # Controladores REST
│   │   ├── 📁 dto/                # Data Transfer Objects
│   │   ├── 📁 entities/           # Entidades
│   │   ├── 📁 errors/             # Mensajes de error
│   │   ├── 📁 repositories/       # Acceso a datos
│   │   ├── 📁 services/           # Lógica de negocio
│   │   ├── 📁 use-cases/          # Casos de uso
│   │   └── time-off.module.ts     # Configuración del módulo
│   ├── 📁 utils/                   # Utilidades del calendario
│   │   └── recurrence-parser.ts   # Parser de reglas de recurrencia
│   ├── calendar.module.ts          # Configuración del módulo principal
│   └── index.ts                    # Exportaciones
├── tsconfig.lib.json              # Configuración TypeScript
└── README.md                      # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture + Repository Pattern
- Event-Driven Architecture con observadores
- Factory Pattern para creación de eventos
- Observer Pattern para sincronización entre módulos
- DTOs fuertemente tipados (TypeScript)
- Auditoría con `AuditModule`

## 🔧 Dependencias del Módulo

### Internas
```typescript
@Module({
  imports: [
    EventsModule,
    TimeOffModule,
    AuditModule,
  ],
  exports: [
    EventsModule,
    TimeOffModule,
  ],
})
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@nestjs/event-emitter`
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (para auditoría y autenticación)
- `date-fns`, `date-fns-tz` (manejo de fechas)
- `class-validator`, `class-transformer`

## 📊 Modelos de Datos Principales

### Eventos (`Event`)
- **Tipos**: `TURNO`, `CITA`, `OTRO`
- **Estados**: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`
- **Recurrencia**: Soporte para eventos recurrentes con excepciones
- **Colores**: Personalización visual por tipo de evento

### Ausencias Temporales (`TimeOff`)
- **Gestión**: Ausencias del personal médico
- **Validación**: Prevención de conflictos de horarios
- **Integración**: Con eventos del calendario

## 🧾 Tipados (Interfaces, Enums y DTOs)

### Enums Principales

Origen: `libs/calendar/src/event/entities/event-type.enum.ts`

```typescript
export enum EventType {
  TURNO = 'TURNO',     // Turnos de trabajo del personal
  CITA = 'CITA',       // Citas médicas
  OTRO = 'OTRO'        // Otros tipos de eventos
}

export enum EventStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED', 
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}
```

### DTOs de Eventos

Origen: `libs/calendar/src/event/dto/*.ts`

```typescript
// create-event.dto.ts
export class CreateEventDto {
  title: string;
  color: string;
  type: EventType;
  status: EventStatus;
  start: Date;
  end: Date;
  staffId: string;
  branchId: string;
  staffScheduleId?: string;
  cancellationReason?: string;
}

// find-events-query.dto.ts
export class FindEventsQueryDto {
  staffId?: string;
  type?: EventType;
  branchId?: string;
  status?: EventStatus;
  staffScheduleId?: string;
  startDate?: string;  // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
}

// pagination.dto.ts
export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;  // Máximo 50
}
```

### DTOs de TimeOff

Origen: `libs/calendar/src/time-off/dto/*.ts`

```typescript
export class CreateTimeOffDto {
  staffId: string;
  branchId: string;
  start: Date;
  end: Date;
  reason?: string;
}

export class UpdateTimeOffDto extends PartialType(CreateTimeOffDto) {}
export class DeleteTimeOffsDto { ids: string[] }
```

### Entidades (Swagger Models)

Origen: `libs/calendar/src/event/entities/event.entity.ts`

```typescript
export class Event {
  id: string;
  title: string;
  type: EventType;
  start: Date;
  end: Date;
  color?: string;
  status?: EventStatus;
  isActive: boolean;
  isCancelled: boolean;
  isBaseEvent?: boolean;
  recurrence?: any;
  exceptionDates?: Date[];
  cancellationReason?: string;
  staffScheduleId?: string;
  staffId: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
  staff?: { name: string; lastName: string };
  branch?: { name: string };
}
```

## 🧱 Repositories y Acceso a Datos

### `EventRepository`
- Extiende `BaseRepository<Event>`
- Métodos específicos:
  - `findEventsByStaff(staffId, start, end)`: Eventos por staff y rango de fechas
  - `findConflictingEvents(staffId, start, end)`: Detección de conflictos
  - `findAvailableTurn(staffId, start, end)`: Buscar turnos disponibles
  - `findEventsByStaffScheduleId(scheduleId, page, limit)`: Paginación
  - `createEvents(events[])`: Creación masiva transaccional
  - `forceUpdate(id, eventData)`: Actualización forzada

### `TimeOffRepository`
- Extiende `BaseRepository<TimeOff>`
- Métodos específicos:
  - `findActiveTimeOffs(staffId, start, end)`: Ausencias activas
  - `findConflictingTimeOffs(staffId, start, end)`: Detección de conflictos

## 🚀 Casos de Uso Principales

### Eventos
- `CreateEventUseCase`: Creación con validación de conflictos
- `UpdateEventUseCase`: Actualización con auditoría
- `DeleteEventsUseCase`: Eliminación permanente
- `CreateRecurrentEventsUseCase`: Generación de eventos recurrentes
- `FindEventsByFilterUseCase`: Búsqueda avanzada con filtros
- `FindEventsByStaffScheduleUseCase`: Eventos por horario de staff

### TimeOff
- `CreateTimeOffUseCase`: Creación con validación de conflictos
- `UpdateTimeOffUseCase`: Actualización con auditoría
- `DeleteTimeOffsUseCase`: Soft delete con auditoría
- `ReactivateTimeOffsUseCase`: Reactivación de ausencias

## 📡 Endpoints API

### Eventos (`/api/v1/events`)
- `GET /filter` — Eventos filtrados — Query: `FindEventsQueryDto` — Respuesta: `Event[]`
- `POST /` — Crear evento — Body: `CreateEventDto` — Respuesta: `BaseApiResponse<Event>`
- `GET /:id` — Obtener evento — Respuesta: `Event`
- `GET /` — Listar todos — Respuesta: `Event[]`
- `PATCH /:id` — Actualizar evento — Body: `UpdateEventDto` — Respuesta: `BaseApiResponse<Event>`
- `DELETE /remove/all` — Eliminar múltiples — Body: `DeleteEventsDto` — Respuesta: `BaseApiResponse<Event[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeleteEventsDto` — Respuesta: `BaseApiResponse<Event[]>`
- `POST /:id/generate-events` — Generar eventos recurrentes — Respuesta: `BaseApiResponse<Event[]>`
- `GET /by-schedule/:scheduleId` — Eventos por horario — Query: `PaginationDto` — Respuesta: `{ events: Event[], total: number }`
- `DELETE /by-schedule/:scheduleId` — Eliminar eventos por horario — Respuesta: `BaseApiResponse<number>`

### TimeOff (`/api/v1/time-off`)
- `POST /` — Crear ausencia — Body: `CreateTimeOffDto` — Respuesta: `BaseApiResponse<TimeOff>`
- `GET /:id` — Obtener ausencia — Respuesta: `TimeOff`
- `GET /` — Listar todas — Respuesta: `TimeOff[]`
- `PATCH /:id` — Actualizar ausencia — Body: `UpdateTimeOffDto` — Respuesta: `BaseApiResponse<TimeOff>`
- `DELETE /remove/all` — Eliminar múltiples — Body: `DeleteTimeOffsDto` — Respuesta: `BaseApiResponse<TimeOff[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeleteTimeOffsDto` — Respuesta: `BaseApiResponse<TimeOff[]>`

## 🔒 Seguridad y Autorización
- Decoradores: `@Auth()`, `@GetUser()`
- Validación de conflictos de horarios
- Auditoría en todas las operaciones CRUD
- Filtrado por staff y sucursal según permisos

## 📏 Reglas y Validaciones de Negocio
- **Conflictos**: Prevención de eventos solapados (excepto citas)
- **Recurrencia**: Generación automática de eventos recurrentes
- **TimeOff**: Validación de ausencias sin conflictos
- **Turnos**: Búsqueda de disponibilidad para citas
- **Zona Horaria**: Manejo correcto de fechas en `America/Lima`

## 🔄 Eventos de Dominio
- `EventObserver`: Escucha eventos de cancelación de órdenes
- Sincronización automática con módulo Pay
- Actualización de colores y estados de eventos
- Cancelación de citas asociadas

## 🧮 Utilidades
- `RecurrenceParser`: Generación de fechas recurrentes
- Soporte para diferentes frecuencias (diaria, semanal, mensual)
- Manejo de excepciones y días específicos
- Conversión de zonas horarias

## 🧪 Testing Recomendado
- Unit: casos de uso de eventos y time-off
- Integration: repositorios con Prisma y transacciones
- E2E: endpoints de calendario con diferentes escenarios
- Validación: conflictos de horarios y recurrencia

## 🚨 Manejo de Errores
- Validación de conflictos de horarios
- Manejo de fechas inválidas en recurrencia
- Errores específicos por tipo de evento
- Logs detallados para debugging

## 🔧 Configuración
Variables sugeridas:
```env
CALENDAR_TIMEZONE=America/Lima
CALENDAR_MAX_EVENTS_PER_PAGE=50
CALENDAR_DEFAULT_COLORS={"TURNO":"blue","CITA":"green","OTRO":"gray"}
```

## 🔗 Integraciones
- **Pay**: Sincronización de cancelaciones de órdenes
- **Staff Schedule**: Generación de eventos recurrentes
- **Login**: Autenticación y auditoría
- **Appointments**: Asociación de citas con eventos

## 📈 Flujo de Trabajo

### Creación de Eventos
1. Validación de datos de entrada
2. Verificación de conflictos de horarios
3. Creación del evento en base de datos
4. Registro de auditoría
5. Emisión de eventos de dominio

### Generación de Eventos Recurrentes
1. Obtención del horario de staff
2. Parseo de reglas de recurrencia
3. Generación de fechas según frecuencia
4. Filtrado de excepciones
5. Creación masiva de eventos

### Gestión de Ausencias
1. Validación de período solicitado
2. Verificación de conflictos con eventos existentes
3. Creación de la ausencia
4. Registro de auditoría

---

## 📚 Documentación de Submódulos

Cada submódulo tiene su propia documentación técnica detallada:

- **📅 Submódulo Events**: `src/event/README.md`
  - Gestión completa de eventos del calendario
  - Eventos recurrentes, conflictos, observadores

- **🏖️ Submódulo TimeOff**: `src/time-off/README.md`
  - Gestión de ausencias temporales del personal
  - Validación de conflictos y períodos

- **🔧 Submódulo Utils**: `src/utils/README.md`
  - Utilidades de recurrencia y manejo de fechas
  - Parser de reglas de recurrencia

---

Documentación del módulo Calendar - Sistema API Juan Pablo II
