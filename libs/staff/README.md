# 👥 Módulo Staff - Documentación Técnica

## 🎯 Descripción General

El módulo **Staff** gestiona el personal de la clínica y los **tipos de personal** (especialidades/cargos). Provee CRUD completo, operaciones en lote (desactivar/reactivar), validaciones de negocio (unicidad de DNI y nombre de tipo), auditoría de acciones y relaciones con `Branch` y `User` cuando aplica.

## 🏗️ Arquitectura del Módulo

### Estructura de Directorios
```
📁 libs/staff/
├── 📁 controllers/                 # Controladores REST (staff y staff-type)
├── 📁 dto/                         # Data Transfer Objects
├── 📁 entities/                    # Entidades del dominio (Swagger models)
├── 📁 errors/                      # Mensajes de error del dominio
├── 📁 repositories/                # Acceso a datos (Prisma BaseRepository)
├── 📁 services/                    # Lógica de negocio
├── 📁 use-cases/                   # Casos de uso (CU)
├── staff.module.ts                 # Configuración del módulo
└── README.md                       # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture + Repository Pattern
- Casos de uso por operación (crear, actualizar, desactivar, reactivar)
- Auditoría con `AuditModule`
- Soft delete y reactivación en lote

## 🔧 Dependencias del Módulo

### Internas
```typescript
@Module({
  imports: [AuditModule],
  controllers: [StaffTypeController, StaffController],
  providers: [
    // Staff
    StaffService,
    StaffRepository,
    CreateStaffUseCase,
    UpdateStaffUseCase,
    DeleteStaffUseCase,
    ReactivateStaffUseCase,
    // Staff Type
    StaffTypeService,
    StaffTypeRepository,
    CreateStaffTypeUseCase,
    UpdateStaffTypeUseCase,
    DeleteStaffTypeUseCase,
    ReactivateStaffTypeUseCase,
  ],
  exports: [StaffTypeService, StaffService],
})
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `class-validator`, `class-transformer`
- `@prisma/client` (tipos y acceso vía `PrismaService`)

## 📊 Modelos de Datos y Tipados

### Entidad: `Staff`
```typescript
class Staff {
  id: string;
  staffTypeId: string;     // Relación con StaffType
  userId: string | null;   // Relación opcional con User del sistema
  name: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  birth: Date;
  cmp: string;             // Colegiatura (opcional)
  branchId: string;        // Sucursal opcional
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  staffType?: { name: string };
}
```

### Entidad: `StaffType`
```typescript
class StaffType {
  id: string;
  name: string;            // Único por negocio
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### DTOs (validaciones y transformaciones)
- `CreateStaffDto`, `UpdateStaffDto`, `DeleteStaffDto`
  - Normalización de strings (`@Transform`), validación de `@IsUUID`, fechas `@Type(() => Date)`
- `CreateStaffTypeDto`, `UpdateStaffTypeDto`, `DeleteStaffTypeDto`
  - Normalización a minúsculas para `name` y `description`, validaciones de requeridos

Ejemplos:
```typescript
class CreateStaffTypeDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  name: string;
  @Transform(({ value }) => value?.trim().toLowerCase())
  description?: string;
}

class CreateStaffDto {
  @IsUUID() staffTypeId: string;
  @Transform(({ value }) => (value.trim() === '' ? undefined : value.trim()))
  userId?: string;
  @Transform(({ value }) => value.trim()) name: string;
  @Transform(({ value }) => value.trim()) lastName: string;
  @Transform(({ value }) => value.trim()) dni: string;
  @Type(() => Date) birth: Date; // desde string YYYY-MM-DD
  @Transform(({ value }) => value.trim()) email: string;
  @Transform(({ value }) => value.trim()) phone?: string;
  @Transform(({ value }) => (value.trim() === '' ? undefined : value.trim()))
  branchId?: string;
}
```

## 🚀 Casos de Uso (Use Cases)

### Staff (Personal)
- `CreateStaffUseCase`
  - Valida existencia de `staffType`
  - Valida unicidad de `dni`
  - Crea Staff y registra auditoría (CREATE)
- `UpdateStaffUseCase`
  - Valida cambios (DNI único, tipo válido)
  - Actualiza y registra auditoría (UPDATE)
- `DeleteStaffUseCase`
  - Soft delete en lote y auditoría (DELETE)
- `ReactivateStaffUseCase`
  - Reactivación en lote y auditoría (UPDATE)

### StaffType (Tipos de Personal)
- `CreateStaffTypeUseCase`
  - Valida unicidad por `name`
  - Crea y audita (CREATE)
- `UpdateStaffTypeUseCase`
  - Valida unicidad de `name` (excluyendo el propio id)
  - Actualiza y audita (UPDATE)
- `DeleteStaffTypeUseCase`
  - Soft delete en lote y audita (DELETE)
- `ReactivateStaffTypeUseCase`
  - Reactivación en lote y audita (UPDATE)

## 📡 Endpoints API

### Base: `/api/v1/staff`
- `POST /` — Crear personal
  - Body: `CreateStaffDto`
  - Respuesta: `BaseApiResponse<Staff>`
- `GET /` — Listar personal
  - Respuesta: `Staff[]`
- `GET /active` — Listar personal activo
  - Respuesta: `Staff[]`
- `GET /:id` — Obtener por ID
  - Respuesta: `Staff`
- `PATCH /:id` — Actualizar personal
  - Body: `UpdateStaffDto`
  - Respuesta: `BaseApiResponse<Staff>`
- `DELETE /remove/all` — Desactivar múltiples
  - Body: `DeleteStaffDto { ids: string[] }`
  - Respuesta: `BaseApiResponse<Staff[]>`
- `PATCH /reactivate/all` — Reactivar múltiples
  - Body: `DeleteStaffDto { ids: string[] }`
  - Respuesta: `BaseApiResponse<Staff[]>`

### Base: `/api/v1/staff-type`
- `POST /` — Crear tipo de personal
  - Body: `CreateStaffTypeDto`
  - Respuesta: `BaseApiResponse<StaffType>`
- `GET /` — Listar tipos
  - Respuesta: `StaffType[]`
- `GET /:id` — Obtener por ID
  - Respuesta: `StaffType`
- `PATCH /:id` — Actualizar tipo
  - Body: `UpdateStaffTypeDto`
  - Respuesta: `BaseApiResponse<StaffType>`
- `DELETE /remove/all` — Desactivar múltiples tipos
  - Body: `DeleteStaffTypeDto { ids: string[] }`
  - Respuesta: `BaseApiResponse<StaffType[]>`
- `PATCH /reactivate/all` — Reactivar múltiples tipos
  - Body: `DeleteStaffTypeDto { ids: string[] }`
  - Respuesta: `BaseApiResponse<StaffType[]>`

## 🔒 Seguridad y Autorización
- Decoradores: `@Auth()`, `@GetUser()` en controladores
- Auditoría de todas las operaciones a través de `AuditModule`

## 🔄 Integraciones
- `Branch`: relación opcional (`branchId`) en `StaffRepository` (con `connect`/`disconnect`)
- `Login/User`: relación opcional por `userId`
- `Appointments/Billing`: consumen `Staff` indirectamente (no acoplamiento directo aquí)

## 📏 Reglas y Validaciones de Negocio
- `dni` único en Staff (creación y actualización)
- `staffType` debe existir (creación y actualización condicional)
- `name` de `StaffType` es único
- Normalización de `name/description` en `StaffType`
- Manejo explícito de nulls en `updateStaff` (userId/cmp/branch)

## 🗄️ Acceso a Datos (Repositories)

### `StaffRepository`
- Selección por defecto con relaciones (`staffType.name`)
- `createStaff(...)`, `updateStaff(...)` con manejo de relaciones `connect/disconnect`
- `findById`, `findMany`, `findManyActive`, `findByField`, `findByStaffType`, `findStaffByDNI`

### `StaffTypeRepository`
- CRUD base vía `BaseRepository`
- Operaciones en lote: `softDeleteMany`, `reactivateMany`

Todas las operaciones críticas se realizan en `transaction(...)` y registran auditoría.

## 🧪 Testing Recomendado
- Unit: casos de uso (validaciones, auditoría)
- Integration: repositorios con Prisma y relaciones
- E2E: endpoints de `staff` y `staff-type` incluyendo operaciones en lote

## 🔧 Configuración (opcional)
Variables sugeridas para reglas de negocio o límites:
```env
STAFF_UNIQUE_DNI=true
STAFFTYPE_NAME_NORMALIZE=true
```

## 📈 Métricas y Monitoreo
- Conteo de Staff por `staffType` y por `branch`
- Tasas de desactivación/reactivación
- Errores de validación (DNI duplicado, tipo inexistente)

## 🚨 Manejo de Errores
Centralizado en `errors/erros-staff.ts`:
- Staff: `notFound`, `alreadyExists`, `invalidData`, `notActive`, `alreadyActive`, `inUse`, `invalidOperation`
- StaffType: mismas claves adaptadas al contexto

Códigos comunes: 400 (validación), 404 (no encontrado), 409 (conflicto), 500 (error interno)

## 🧾 Tipados y Swagger
- Entidades anotadas con `@ApiProperty` para esquemas Swagger
- DTOs validados con `class-validator`
- Repos genéricos (`BaseRepository<Staff|StaffType>`) con tipado estático

---

Documentación del módulo Staff - Sistema API Juan Pablo II
