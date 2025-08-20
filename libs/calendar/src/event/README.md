# 📅 Submódulo Events - Documentación Técnica

## 🎯 Descripción General

El submódulo **Events** gestiona todos los **eventos del calendario** del sistema médico, incluyendo turnos de trabajo, citas médicas y otros eventos. Proporciona funcionalidades para crear, actualizar, eliminar eventos, generar eventos recurrentes, detectar conflictos de horarios y sincronizar con otros módulos mediante observadores de eventos de dominio.

## 🏗️ Arquitectura del Submódulo

### Estructura de Directorios
```
📁 libs/calendar/src/event/
├── 📁 controllers/          # Controladores REST
│   ├── event.controller.ts  # Endpoints principales de eventos
├── 📁 dto/                 # Data Transfer Objects
│   ├── create-event.dto.ts
│   ├── update-event.dto.ts
│   ├── delete-events.dto.ts
│   ├── find-events-query.dto.ts
│   ├── pagination.dto.ts
│   └── event-response.dto.ts
├── 📁 entities/            # Entidades (Swagger models)
│   ├── event.entity.ts
│   └── event-type.enum.ts
├── 📁 errors/              # Mensajes de error
│   └── errors-event.ts
├── 📁 factories/           # Factories para creación de eventos
│   └── event.factory.ts
├── 📁 observers/           # Observadores de eventos de dominio
│   ├── event.observer.ts
│   └── event.subject.ts
├── 📁 repositories/        # Acceso a datos
│   └── event.repository.ts
├── 📁 scheduling/          # Lógica de programación
│   └── scheduling.facade.ts
├── 📁 services/            # Lógica de negocio
│   └── event.service.ts
├── 📁 use-cases/           # Casos de uso
│   ├── create-event.use-case.ts
│   ├── update-event.use-case.ts
│   ├── delete-events.use-case.ts
│   ├── reactivate-events.use-case.ts
│   ├── create-recurrent-events.use-case.ts
│   ├── find-events-by-filter.use-case.ts
│   ├── find-events-by-staff-schedule.use-case.ts
│   └── delete-events-by-staff-schedule.use-case.ts
├── 📁 validators/          # Validadores
│   └── event.validator.ts
└── events.module.ts        # Configuración del módulo
```

### Patrón Arquitectónico
- Clean Architecture + Repository Pattern
- Event-Driven Architecture con `EventObserver`
- Factory Pattern con `EventFactory`
- Observer Pattern para sincronización con módulo Pay
- DTOs fuertemente tipados con validaciones
- Auditoría en todas las operaciones

## 🔧 Dependencias del Submódulo

### Internas
```typescript
@Module({
  imports: [
    AuditModule,
    forwardRef(() => StaffScheduleModule),
    PrismaModule,
  ],
  providers: [
    EventRepository,
    EventService,
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventsUseCase,
    ReactivateEventsUseCase,
    CreateRecurrentEventsUseCase,
    FindEventsByFilterUseCase,
    FindEventsByStaffScheduleUseCase,
    DeleteEventsByStaffScheduleUseCase,
    EventFactory,
    RecurrenceParser,
    EventObserver,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  controllers: [EventController],
  exports: [EventService, EventRepository],
})
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@nestjs/event-emitter`
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (para auditoría y autenticación)
- `date-fns`, `date-fns-tz` (manejo de fechas)
- `moment-timezone` (conversión de zonas horarias)

## 📊 Modelos de Datos

### Entidad: `Event`
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

### Enums
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

## 🧾 Tipados (Interfaces, Enums y DTOs)

### DTOs Principales

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

// update-event.dto.ts
export class UpdateEventDto extends PartialType(CreateEventDto) {}

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

// delete-events.dto.ts
export class DeleteEventsDto {
  ids: string[];
}
```

### Eventos de Dominio

Origen: `libs/calendar/src/event/observers/event.subject.ts`

```typescript
export enum CalendarEvents {
  EVENT_CREATED = 'calendar.event.created',
  EVENT_UPDATED = 'calendar.event.updated',
  EVENT_CANCELLED = 'calendar.event.cancelled',
  EVENT_COMPLETED = 'calendar.event.completed',
}

export interface CalendarEventPayload {
  eventId: string;
  metadata?: Record<string, any>;
}
```

## 🧱 Repositories y Acceso a Datos

### `EventRepository`
Extiende `BaseRepository<Event>` con métodos específicos:

```typescript
class EventRepository {
  // Búsquedas específicas
  findEventsByStaff(staffId: string, start: Date, end: Date): Promise<Event[]>
  findConflictingEvents(staffId: string, start: Date, end: Date): Promise<Event[]>
  findAvailableTurn(staffId: string, start: Date, end: Date): Promise<Event | null>
  findEventsByStaffScheduleId(scheduleId: string, page: number, limit: number): Promise<{ events: Event[], total: number }>
  
  // Operaciones masivas
  createEvents(events: Event[]): Promise<Event[]>
  deleteManyByStaffScheduleId(staffScheduleId: string): Promise<number>
  
  // Actualizaciones especiales
  updateEventStatus(eventId: string, status: EventStatus, color: string): Promise<Event>
  forceUpdate(id: string, eventData: any): Promise<Event>
}
```

## 🚀 Casos de Uso

### `CreateEventUseCase`
- Valida conflictos de horarios (excepto para citas)
- Crea evento con estado `CONFIRMED`
- Registra auditoría de creación
- Retorna evento creado

### `UpdateEventUseCase`
- Actualiza datos del evento
- Registra auditoría de actualización
- Retorna evento actualizado

### `CreateRecurrentEventsUseCase`
- Genera eventos recurrentes desde horarios de staff
- Utiliza `RecurrenceParser` para fechas
- Filtra excepciones del horario
- Crea eventos masivamente en transacción

### `FindEventsByFilterUseCase`
- Búsqueda avanzada con múltiples filtros
- Soporte para rangos de fechas
- Incluye relaciones con staff y branch
- Ordenamiento por fecha de inicio

### `DeleteEventsByStaffScheduleUseCase`
- Elimina todos los eventos de un horario específico
- Registra auditoría por cada evento eliminado
- Retorna conteo de eventos eliminados

## 📡 Endpoints API

### Eventos (`/api/v1/events`)

#### Búsqueda y Filtrado
- `GET /filter` — Eventos filtrados — Query: `FindEventsQueryDto` — Respuesta: `Event[]`
- `GET /by-schedule/:scheduleId` — Eventos por horario — Query: `PaginationDto` — Respuesta: `{ events: Event[], total: number }`

#### CRUD Básico
- `POST /` — Crear evento — Body: `CreateEventDto` — Respuesta: `BaseApiResponse<Event>`
- `GET /:id` — Obtener evento — Respuesta: `Event`
- `GET /` — Listar todos — Respuesta: `Event[]`
- `PATCH /:id` — Actualizar evento — Body: `UpdateEventDto` — Respuesta: `BaseApiResponse<Event>`

#### Operaciones Masivas
- `DELETE /remove/all` — Eliminar múltiples — Body: `DeleteEventsDto` — Respuesta: `BaseApiResponse<Event[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeleteEventsDto` — Respuesta: `BaseApiResponse<Event[]>`

#### Eventos Recurrentes
- `POST /:id/generate-events` — Generar eventos recurrentes — Respuesta: `BaseApiResponse<Event[]>`
- `DELETE /by-schedule/:scheduleId` — Eliminar eventos por horario — Respuesta: `BaseApiResponse<number>`

## 🔄 Eventos de Dominio y Observadores

### `EventObserver`
Escucha eventos del módulo Pay para sincronización:

```typescript
@OnEvent('order.cancelled')
async handleOrderCancelled(payload: any) {
  // Procesa cancelaciones de órdenes
  // Actualiza eventos asociados a color rojo
  // Cancela citas relacionadas
}
```

### Tipos de Órdenes Procesadas
- `MEDICAL_APPOINTMENT_ORDER`: Actualiza eventos de citas
- `MEDICAL_PRESCRIPTION_ORDER`: Actualiza eventos de prescripciones

### Flujo de Sincronización
1. Recibe evento `order.cancelled` del módulo Pay
2. Identifica tipo de orden y citas asociadas
3. Actualiza eventos a color rojo y estado `CANCELLED`
4. Cancela citas relacionadas en base de datos

## 🏭 Factories

### `EventFactory`
Crea eventos según su tipo:

```typescript
class EventFactory {
  createBaseEvent(dto: CreateEventDto): Event
  generateRecurrentEvents(baseEvent: Event, staffSchedule: StaffSchedule): Promise<Event[]>
  private configureTurnoEvent(event: Event, dto: CreateEventDto): Event
  private generateDefaultTitle(type: EventType): string
}
```

## 📏 Reglas y Validaciones de Negocio

### Conflictos de Horarios
- **Turnos**: No pueden solaparse con otros turnos
- **Citas**: Pueden solaparse (múltiples citas simultáneas)
- **Validación**: Se ejecuta en `CreateEventUseCase`

### Estados de Eventos
- **CONFIRMED**: Estado por defecto para turnos
- **CANCELLED**: Eventos cancelados (color rojo)
- **COMPLETED**: Eventos completados
- **NO_SHOW**: Paciente no se presentó

### Recurrencia
- Soporte para frecuencias: diaria, semanal, mensual
- Manejo de excepciones por fecha
- Generación automática desde horarios de staff

## 🧪 Testing Recomendado
- Unit: casos de uso de creación y actualización
- Integration: repositorios con Prisma
- E2E: endpoints de eventos con diferentes escenarios
- Observer: sincronización con módulo Pay

## 🚨 Manejo de Errores
- Validación de conflictos de horarios
- Manejo de fechas inválidas
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
- **Utils**: Parser de recurrencia

---

Documentación del submódulo Events - Sistema API Juan Pablo II
