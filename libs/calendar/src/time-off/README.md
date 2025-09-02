# 🏖️ Submódulo TimeOff - Documentación Técnica

## 🎯 Descripción General

El submódulo **TimeOff** gestiona las **ausencias temporales** del personal médico y administrativo. Permite solicitar y administrar períodos de ausencia como vacaciones, licencias médicas, días libres y otros tipos de tiempo libre. Incluye validación de conflictos de horarios y auditoría completa de todas las operaciones.

## 🏗️ Arquitectura del Submódulo

### Estructura de Directorios
```
📁 libs/calendar/src/time-off/
├── 📁 controllers/         # Controladores REST
│   └── time-off.controller.ts
├── 📁 dto/                # Data Transfer Objects
│   ├── create-time-off.dto.ts
│   ├── update-time-off.dto.ts
│   └── delete-time-offs.dto.ts
├── 📁 entities/           # Entidades (Swagger models)
│   └── time-off.entity.ts
├── 📁 errors/             # Mensajes de error
│   └── errors-time-off.ts
├── 📁 repositories/       # Acceso a datos
│   └── time-off.repository.ts
├── 📁 services/           # Lógica de negocio
│   └── time-off.service.ts
├── 📁 use-cases/          # Casos de uso
│   ├── create-time-off.use-case.ts
│   ├── update-time-off.use-case.ts
│   ├── delete-time-offs.use-case.ts
│   └── reactivate-time-offs.use-case.ts
├── time-off.module.ts     # Configuración del módulo
└── README.md             # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture + Repository Pattern
- DTOs fuertemente tipados con validaciones
- Auditoría en todas las operaciones CRUD
- Validación de conflictos de horarios
- Soft delete para mantenimiento de historial

## 🔧 Dependencias del Submódulo

### Internas
```typescript
@Module({
  imports: [AuditModule],
  providers: [
    TimeOffRepository,
    TimeOffService,
    CreateTimeOffUseCase,
    UpdateTimeOffUseCase,
    DeleteTimeOffsUseCase,
    ReactivateTimeOffsUseCase,
  ],
  controllers: [TimeOffController],
  exports: [TimeOffService],
})
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (para auditoría y autenticación)
- `class-validator`, `class-transformer`

## 📊 Modelos de Datos

### Entidad: `TimeOff`
```typescript
export class TimeOff {
  id: string;
  staffId: string;
  branchId: string;
  start: Date;
  end: Date;
  reason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧾 Tipados (Interfaces, Enums y DTOs)

### DTOs Principales

Origen: `libs/calendar/src/time-off/dto/*.ts`

```typescript
// create-time-off.dto.ts
export class CreateTimeOffDto {
  staffId: string;
  branchId: string;
  start: Date;
  end: Date;
  reason?: string;
}

// update-time-off.dto.ts
export class UpdateTimeOffDto extends PartialType(CreateTimeOffDto) {}

// delete-time-offs.dto.ts
export class DeleteTimeOffsDto {
  ids: string[];
}
```

### Mensajes de Error

Origen: `libs/calendar/src/time-off/errors/errors-time-off.ts`

```typescript
export const timeOffErrorMessages: ErrorMessages = {
  notFound: 'Solicitud de tiempo libre no encontrada',
  alreadyExists: 'La solicitud de tiempo libre ya existe',
  invalidData: 'Datos de la solicitud de tiempo libre inválidos',
  notActive: 'La solicitud de tiempo libre no está activa',
  alreadyActive: 'La solicitud de tiempo libre ya está activa',
  inUse: 'La solicitud de tiempo libre está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la solicitud de tiempo libre',
};
```

## 🧱 Repositories y Acceso a Datos

### `TimeOffRepository`
Extiende `BaseRepository<TimeOff>` con métodos específicos:

```typescript
class TimeOffRepository {
  // Búsquedas específicas
  findActiveTimeOffs(staffId: string, start: Date, end: Date): Promise<TimeOff[]>
  
  // Validación de conflictos
  findConflictingTimeOffs(staffId: string, start: Date, end: Date): Promise<TimeOff[]>
}
```

### Métodos de Validación de Conflictos
```typescript
findConflictingTimeOffs(staffId: string, start: Date, end: Date): Promise<TimeOff[]> {
  // Caso 1: Nueva ausencia comienza durante una existente
  // Caso 2: Nueva ausencia termina durante una existente  
  // Caso 3: Nueva ausencia engloba completamente una existente
}
```

## 🚀 Casos de Uso

### `CreateTimeOffUseCase`
- Valida conflictos con ausencias existentes
- Crea la ausencia temporal
- Registra auditoría de creación
- Retorna ausencia creada

### `UpdateTimeOffUseCase`
- Actualiza datos de la ausencia
- Registra auditoría de actualización
- Retorna ausencia actualizada

### `DeleteTimeOffsUseCase`
- Realiza soft delete de múltiples ausencias
- Registra auditoría por cada ausencia eliminada
- Retorna ausencias desactivadas

### `ReactivateTimeOffsUseCase`
- Reactiva múltiples ausencias desactivadas
- Registra auditoría de reactivación
- Retorna ausencias reactivadas

## 📡 Endpoints API

### TimeOff (`/api/v1/time-off`)

#### CRUD Básico
- `POST /` — Crear ausencia — Body: `CreateTimeOffDto` — Respuesta: `BaseApiResponse<TimeOff>`
- `GET /:id` — Obtener ausencia — Respuesta: `TimeOff`
- `GET /` — Listar todas — Respuesta: `TimeOff[]`
- `PATCH /:id` — Actualizar ausencia — Body: `UpdateTimeOffDto` — Respuesta: `BaseApiResponse<TimeOff>`

#### Operaciones Masivas
- `DELETE /remove/all` — Eliminar múltiples — Body: `DeleteTimeOffsDto` — Respuesta: `BaseApiResponse<TimeOff[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeleteTimeOffsDto` — Respuesta: `BaseApiResponse<TimeOff[]>`

## 🔒 Seguridad y Autorización
- Decoradores: `@Auth()`, `@GetUser()`
- Validación de conflictos de horarios
- Auditoría en todas las operaciones CRUD
- Filtrado por staff y sucursal según permisos

## 📏 Reglas y Validaciones de Negocio

### Validación de Conflictos
- **Período Solapado**: No puede haber ausencias que se solapen
- **Caso 1**: Nueva ausencia comienza durante una existente
- **Caso 2**: Nueva ausencia termina durante una existente
- **Caso 3**: Nueva ausencia engloba completamente una existente

### Estados de Ausencias
- **Activa**: Ausencia vigente y válida
- **Inactiva**: Ausencia desactivada (soft delete)
- **Reactivable**: Puede ser reactivada desde estado inactivo

### Validaciones de Fechas
- **Fecha Inicio**: Debe ser anterior a fecha fin
- **Período Válido**: No puede ser en el pasado (configurable)
- **Duración Máxima**: Límite configurable de días consecutivos

## 🧪 Testing Recomendado
- Unit: casos de uso de creación y validación
- Integration: repositorios con Prisma
- E2E: endpoints de time-off con diferentes escenarios
- Validación: conflictos de horarios y períodos

## 🚨 Manejo de Errores
- Validación de conflictos de períodos
- Manejo de fechas inválidas
- Errores específicos por tipo de operación
- Logs detallados para debugging

## 🔧 Configuración
Variables sugeridas:
```env
TIMEOFF_MAX_DURATION_DAYS=30
TIMEOFF_MIN_ADVANCE_DAYS=1
TIMEOFF_ALLOW_PAST_DATES=false
```

## 🔗 Integraciones
- **Login**: Autenticación y auditoría
- **Calendar**: Integración con eventos del calendario
- **Staff**: Validación de personal existente
- **Branch**: Validación de sucursales

## 📈 Flujo de Trabajo

### Creación de Ausencia
1. Validación de datos de entrada
2. Verificación de conflictos con ausencias existentes
3. Creación de la ausencia en base de datos
4. Registro de auditoría
5. Retorno de la ausencia creada

### Actualización de Ausencia
1. Validación de cambios significativos
2. Verificación de conflictos si cambian las fechas
3. Actualización de la ausencia
4. Registro de auditoría
5. Retorno de la ausencia actualizada

### Eliminación de Ausencias
1. Validación de IDs proporcionados
2. Soft delete de las ausencias
3. Registro de auditoría por cada ausencia
4. Retorno de ausencias desactivadas

---

Documentación del submódulo TimeOff - Sistema API Juan Pablo II
