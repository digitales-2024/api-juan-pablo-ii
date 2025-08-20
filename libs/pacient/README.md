# 👥 Módulo Pacient - Documentación Técnica

## 🎯 Descripción General

El módulo **Pacient** gestiona toda la información relacionada con los **pacientes** del centro médico, incluyendo datos personales, historias médicas, recetas médicas y actualizaciones de historias clínicas. Proporciona funcionalidades completas para el manejo de pacientes, desde su registro inicial hasta el seguimiento de su evolución médica, incluyendo gestión de imágenes y documentos médicos.

## 🏗️ Arquitectura del Módulo

### Estructura de Directorios
```
📁 libs/pacient/
├── 📁 src/
│   ├── 📁 pacient/              # Gestión principal de pacientes
│   │   ├── 📁 controllers/      # Controladores REST
│   │   ├── 📁 dto/             # Data Transfer Objects
│   │   ├── 📁 entities/        # Entidades (Swagger models)
│   │   ├── 📁 errors/          # Mensajes de error
│   │   ├── 📁 repositories/    # Acceso a datos
│   │   ├── 📁 services/        # Lógica de negocio
│   │   └── 📁 use-cases/       # Casos de uso
│   ├── 📁 history/             # Gestión de historias médicas
│   │   ├── 📁 controllers/     # Controladores REST
│   │   ├── 📁 dto/            # Data Transfer Objects
│   │   ├── 📁 entities/       # Entidades
│   │   ├── 📁 errors/         # Mensajes de error
│   │   ├── 📁 repositories/   # Acceso a datos
│   │   ├── 📁 services/       # Lógica de negocio
│   │   └── 📁 use-cases/      # Casos de uso
│   ├── 📁 recipe/              # Gestión de recetas médicas
│   │   ├── 📁 controllers/     # Controladores REST
│   │   ├── 📁 dto/            # Data Transfer Objects
│   │   ├── 📁 entities/       # Entidades
│   │   ├── 📁 errors/         # Mensajes de error
│   │   ├── 📁 repositories/   # Acceso a datos
│   │   ├── 📁 services/       # Lógica de negocio
│   │   └── 📁 use-cases/      # Casos de uso
│   ├── 📁 update-history/      # Gestión de actualizaciones de historias
│   │   ├── 📁 controllers/     # Controladores REST
│   │   ├── 📁 dto/            # Data Transfer Objects
│   │   ├── 📁 entities/       # Entidades
│   │   ├── 📁 errors/         # Mensajes de error
│   │   ├── 📁 repositories/   # Acceso a datos
│   │   ├── 📁 services/       # Lógica de negocio
│   │   └── 📁 use-cases/      # Casos de uso
│   ├── pacient.module.ts       # Configuración del módulo principal
│   └── index.ts               # Exportaciones
├── tsconfig.lib.json         # Configuración TypeScript
└── README.md                 # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture + Repository Pattern
- DTOs fuertemente tipados con validaciones
- Auditoría en todas las operaciones CRUD
- Gestión de imágenes con Cloudflare
- Soft delete para mantenimiento de historial
- Validación de referencias entre entidades

## 🔧 Dependencias del Módulo

### Internas
```typescript
@Module({
  controllers: [
    PacientController,
    PrescriptionController,
    UpdateHistoryController,
    MedicalHistoryController,
  ],
  imports: [AuditModule, CloudflareModule],
  providers: [
    // Paciente
    PacientService,
    PacientRepository,
    CreatePatientUseCase,
    UpdatePatientUseCase,
    DeletePatientsUseCase,
    ReactivatePacientUseCase,
    // Receta
    PrescriptionService,
    PrescriptionRepository,
    CreatePrescriptionUseCase,
    UpdatePrescriptionUseCase,
    DeletePrescriptionsUseCase,
    ReactivatePrescriptionUseCase,
    // Historia médica actualización
    UpdateHistoryService,
    UpdateHistoryRepository,
    CreateUpdateHistoryUseCase,
    UpdateUpdateHistoryUseCase,
    DeleteUpdateHistoriesUseCase,
    ReactivateUpdateHistoryUseCase,
    // Historia médica
    MedicalHistoryService,
    MedicalHistoryRepository,
    CreateMedicalHistoryUseCase,
    UpdateMedicalHistoryUseCase,
    DeleteMedicalHistoriesUseCase,
    ReactivateMedicalHistoryUseCase,
  ],
  exports: [PacientService],
})
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@nestjs/platform-express` (para manejo de archivos)
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (para auditoría y autenticación)
- `class-validator`, `class-transformer`
- `CloudflareModule` (para gestión de imágenes)

## 📊 Modelos de Datos Principales

### Paciente (`Patient`)
- **Datos Personales**: nombre, apellido, DNI, fecha de nacimiento, género
- **Información de Contacto**: dirección, teléfono, email, contacto de emergencia
- **Información Médica**: tipo de sangre, médico principal, seguro médico
- **Información Laboral**: ocupación, lugar de trabajo
- **Imagen**: foto del paciente (opcional)

### Historia Médica (`MedicalHistory`)
- **Datos del Paciente**: ID del paciente, nombre completo, DNI
- **Historia Clínica**: datos médicos estructurados (antecedentes, alergias, etc.)
- **Descripción**: notas adicionales sobre la historia médica

### Receta Médica (`Prescription`)
- **Información Básica**: ID de actualización, sucursal, personal médico, paciente
- **Medicamentos**: lista de medicamentos con dosificación
- **Servicios**: lista de servicios médicos prescritos
- **Descripción**: notas adicionales sobre la receta

### Actualización de Historia (`UpdateHistory`)
- **Información de la Consulta**: servicio, personal médico, sucursal
- **Datos Médicos**: diagnóstico, tratamiento, observaciones
- **Descanso Médico**: fechas, duración, descripción
- **Imágenes**: múltiples imágenes asociadas a la actualización

## 🧾 Tipados (Interfaces, Enums y DTOs)

### DTOs de Paciente

Origen: `libs/pacient/src/pacient/dto/*.ts`

```typescript
// create-pacient.dto.ts
export class CreatePatientDto {
  name: string;
  lastName?: string;
  dni: string;
  birthDate: string;
  gender: string;
  address?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  healthInsurance?: string;
  maritalStatus?: string;
  occupation?: string;
  workplace?: string;
  bloodType?: string;
  primaryDoctor?: string;
  sucursal?: string;
  notes?: string;
  patientPhoto?: string;
}

// update-pacient.dto.ts
export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  id?: string;
  image?: undefined;
}

// delete-pacient.dto.ts
export class DeletePatientDto {
  ids: string[];
}
```

### DTOs de Historia Médica

Origen: `libs/pacient/src/history/dto/*.ts`

```typescript
// create-history.dto.ts
export class CreateMedicalHistoryDto {
  patientId: string;
  medicalHistory?: MedicalHistoryData;
  description?: string;
}

export type MedicalHistoryData = Record<string, string>;

// update-history.dto.ts
export class UpdateMedicalHistoryDto extends PartialType(CreateMedicalHistoryDto) {}

// delete-history.dto.ts
export class DeleteMedicalHistoryDto {
  ids: string[];
}
```

### DTOs de Receta Médica

Origen: `libs/pacient/src/recipe/dto/*.ts`

```typescript
// create-recipe.dto.ts
export class PrescriptionItemDto {
  id?: string;
  name?: string;
  quantity?: number;
  description?: string;
}

export class CreatePrescriptionDto {
  updateHistoryId: string;
  branchId: string;
  staffId: string;
  patientId: string;
  registrationDate: string;
  prescriptionMedicaments?: PrescriptionItemDto[];
  prescriptionServices?: PrescriptionItemDto[];
  description?: string;
  purchaseOrderId?: string;
}

// update-recipe.dto.ts
export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {}

// delete-recipe.dto.ts
export class DeletePrescriptionDto {
  ids: string[];
}
```

### DTOs de Actualización de Historia

Origen: `libs/pacient/src/update-history/dto/*.ts`

```typescript
// create-up-history.dto.ts
export class CreateUpdateHistoryDto {
  patientId: string;
  serviceId: string;
  staffId: string;
  branchId: string;
  medicalHistoryId: string;
  prescription?: boolean;
  prescriptionId?: string;
  updateHistory: any;
  description?: string;
  medicalLeave?: boolean;
  medicalLeaveStartDate?: string;
  medicalLeaveEndDate?: string;
  medicalLeaveDays?: number;
  leaveDescription?: string;
}

// update-up-history.dto.ts
export class UpdateUpdateHistoryDto extends PartialType(CreateUpdateHistoryDto) {}

// delete-up-history.dto.ts
export class DeleteUpdateHistoryDto {
  ids: string[];
}
```

### Entidades (Swagger Models)

Origen: `libs/pacient/src/*/entities/*.ts`

```typescript
// pacient.entity.ts
export class Patient {
  id: string;
  name: string;
  lastName?: string;
  dni: string;
  birthDate: string;
  gender: string;
  address?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  healthInsurance?: string;
  maritalStatus?: string;
  occupation?: string;
  workplace?: string;
  bloodType?: string;
  primaryDoctor?: string;
  sucursal?: string;
  notes?: string;
  patientPhoto?: string;
  isActive: boolean;
}

// history.entity.ts
export class MedicalHistory {
  id: string;
  patientId: string;
  medicalHistory?: Record<string, string>;
  description?: string;
  isActive: boolean;
}

// recipe.entity.ts
export class Prescription {
  id: string;
  updateHistoryId: string;
  branchId: string;
  staffId: string;
  patientId: string;
  registrationDate: string;
  prescriptionMedicaments: PrescriptionItemResponse[];
  prescriptionServices: PrescriptionItemResponse[];
  description?: string;
  purchaseOrderId?: string;
  isActive: boolean;
}

// up-history.entity.ts
export class UpdateHistory {
  id: string;
  patientId: string;
  serviceId: string;
  staffId: string;
  branchId: string;
  medicalHistoryId: string;
  prescription: boolean;
  prescriptionId?: string;
  updateHistory: any;
  description?: string;
  medicalLeave: boolean;
  medicalLeaveStartDate?: string;
  medicalLeaveEndDate?: string;
  medicalLeaveDays?: number;
  leaveDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🧱 Repositories y Acceso a Datos

### `PacientRepository`
- Extiende `BaseRepository<Patient>`
- Métodos específicos:
  - `findPatientByDNI(dni)`: Búsqueda por DNI
  - `findPatientPrescriptions(limit, offset)`: Pacientes con prescripciones
  - `findPrescriptionsByPatientDNI(dni)`: Prescripciones por DNI
  - `getPacientesPorSucursal()`: KPIs por sucursal

### `MedicalHistoryRepository`
- Extiende `BaseRepository<MedicalHistory>`
- Métodos específicos:
  - `findByIdValidate(table, id)`: Validación de referencias
  - `findPatientFullNameById(patientId)`: Nombre completo del paciente
  - `updateMedicalHistoryFullName(id, patientId, fullName, dni)`: Actualización de datos
  - `findOneWithUpdatesAndImages(patientId)`: Historia con actualizaciones

### `PrescriptionRepository`
- Extiende `BaseRepository<Prescription>`
- Métodos específicos:
  - `findByIdValidate(table, id)`: Validación de referencias
  - `updatePrescriptionInHistory(updateHistoryId, prescriptionId)`: Actualización de historial
  - `findPrescriptionsWithPatient(limit, offset, branchFilter)`: Prescripciones con pacientes

### `UpdateHistoryRepository`
- Extiende `BaseRepository<UpdateHistory>`
- Métodos específicos:
  - `findByIdValidate(table, id)`: Validación de referencias
  - `createImagePatient(data)`: Creación de imágenes
  - `findImagesByHistoryId(updateHistoryId)`: Imágenes por historia
  - `updateImageUrl(imageId, newUrl)`: Actualización de URLs

## 🚀 Casos de Uso Principales

### Paciente
- `CreatePatientUseCase`: Creación con validación de DNI
- `UpdatePatientUseCase`: Actualización con auditoría
- `DeletePatientsUseCase`: Soft delete con auditoría
- `ReactivatePacientUseCase`: Reactivación de pacientes

### Historia Médica
- `CreateMedicalHistoryUseCase`: Creación con datos del paciente
- `UpdateMedicalHistoryUseCase`: Actualización con auditoría
- `DeleteMedicalHistoriesUseCase`: Soft delete con auditoría
- `ReactivateMedicalHistoryUseCase`: Reactivación de historias

### Receta Médica
- `CreatePrescriptionUseCase`: Creación con validación de referencias
- `UpdatePrescriptionUseCase`: Actualización con auditoría
- `DeletePrescriptionsUseCase`: Soft delete con auditoría
- `ReactivatePrescriptionUseCase`: Reactivación de recetas

### Actualización de Historia
- `CreateUpdateHistoryUseCase`: Creación con validación de referencias
- `UpdateUpdateHistoryUseCase`: Actualización con auditoría
- `DeleteUpdateHistoriesUseCase`: Soft delete con auditoría
- `ReactivateUpdateHistoryUseCase`: Reactivación de actualizaciones

## 📡 Endpoints API

### Paciente (`/api/v1/paciente`)
- `POST /` — Crear paciente — Body: `CreatePatientDto` — Respuesta: `BaseApiResponse<Patient>`
- `POST /create-with-image` — Crear con imagen — Body: `CreatePatientDto` + File — Respuesta: `BaseApiResponse<Patient>`
- `GET /` — Listar todos — Respuesta: `Patient[]`
- `GET /dni/:dni` — Buscar por DNI — Respuesta: `Patient[]`
- `GET /:id` — Obtener por ID — Respuesta: `Patient`
- `PATCH /:id` — Actualizar — Body: `UpdatePatientDto` — Respuesta: `BaseApiResponse<Patient>`
- `PATCH /:id/update-with-image` — Actualizar con imagen — Body: `UpdatePatientDto` + File — Respuesta: `BaseApiResponse<Patient>`
- `DELETE /remove/all` — Eliminar múltiples — Body: `DeletePatientDto` — Respuesta: `BaseApiResponse<Patient[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeletePatientDto` — Respuesta: `BaseApiResponse<Patient[]>`
- `GET /dashboard/pacientes-por-sucursal` — KPIs por sucursal — Respuesta: `{ data: any[] }`

### Historia Médica (`/api/v1/medical-history`)
- `POST /` — Crear historia — Body: `CreateMedicalHistoryDto` — Respuesta: `BaseApiResponse<MedicalHistory>`
- `GET /` — Listar todas — Respuesta: `MedicalHistory[]`
- `GET /:id` — Obtener por ID — Respuesta: `MedicalHistory`
- `GET /:id/complete` — Obtener completa — Respuesta: `UpdateHistoryResponse`
- `PATCH /:id` — Actualizar — Body: `UpdateMedicalHistoryDto` — Respuesta: `BaseApiResponse<MedicalHistory>`
- `DELETE /remove/all` — Eliminar múltiples — Body: `DeleteMedicalHistoryDto` — Respuesta: `BaseApiResponse<MedicalHistory[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeleteMedicalHistoryDto` — Respuesta: `BaseApiResponse<MedicalHistory[]>`

### Receta Médica (`/api/v1/receta`)
- `POST /` — Crear receta — Body: `CreatePrescriptionDto` — Respuesta: `BaseApiResponse<Prescription>`
- `GET /` — Listar todas — Respuesta: `Prescription[]`
- `GET /patients` — Con pacientes — Query: `limit, offset` — Respuesta: `PatientPrescriptions[]`
- `GET /withPatient` — Con datos de paciente — Query: `limit, offset` — Respuesta: `PrescriptionWithPatient[]`
- `GET /patient/:dni` — Por DNI de paciente — Respuesta: `PatientPrescriptions`
- `GET /:id` — Obtener por ID — Respuesta: `Prescription`
- `PATCH /:id` — Actualizar — Body: `UpdatePrescriptionDto` — Respuesta: `BaseApiResponse<Prescription>`
- `DELETE /remove/all` — Eliminar múltiples — Body: `DeletePrescriptionDto` — Respuesta: `BaseApiResponse<Prescription[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeletePrescriptionDto` — Respuesta: `BaseApiResponse<Prescription[]>`

### Actualización de Historia (`/api/v1/update-history`)
- `POST /` — Crear actualización — Body: `CreateUpdateHistoryDto` — Respuesta: `BaseApiResponse<UpdateHistory>`
- `POST /create-with-images` — Crear con imágenes — Body: `CreateUpdateHistoryDto` + Files — Respuesta: `BaseApiResponse<UpdateHistory & { images }>`
- `GET /` — Listar todas — Respuesta: `UpdateHistory[]`
- `GET /:id` — Obtener por ID — Respuesta: `UpdateHistory`
- `GET /:id/with-images` — Con imágenes — Respuesta: `UpdateHistory & { images }`
- `PATCH /:id` — Actualizar — Body: `UpdateUpdateHistoryDto` — Respuesta: `BaseApiResponse<UpdateHistory>`
- `PATCH /:id/update-with-images` — Actualizar con imágenes — Body: `UpdateUpdateHistoryDto` + Files — Respuesta: `BaseApiResponse<UpdateHistory & { images }>`
- `DELETE /remove/all` — Eliminar múltiples — Body: `DeleteUpdateHistoryDto` — Respuesta: `BaseApiResponse<UpdateHistory[]>`
- `PATCH /reactivate/all` — Reactivar múltiples — Body: `DeleteUpdateHistoryDto` — Respuesta: `BaseApiResponse<UpdateHistory[]>`

## 🔒 Seguridad y Autorización
- Decoradores: `@Auth()`, `@GetUser()`, `@GetUserBranch()`
- Validación de referencias entre entidades
- Auditoría en todas las operaciones CRUD
- Filtrado por sucursal según permisos de usuario
- Validación de tipos de archivo para imágenes

## 📏 Reglas y Validaciones de Negocio
- **DNI Único**: No puede haber pacientes duplicados por DNI
- **Referencias Válidas**: Todas las entidades referenciadas deben existir
- **Imágenes**: Solo formatos JPEG, PNG, GIF, WEBP permitidos
- **Descanso Médico**: Fechas de inicio y fin deben ser coherentes
- **Prescripciones**: Deben estar asociadas a actualizaciones de historia válidas

## 🧪 Testing Recomendado
- Unit: casos de uso de creación y validación
- Integration: repositorios con Prisma
- E2E: endpoints de pacientes con diferentes escenarios
- Validación: referencias entre entidades y manejo de imágenes

## 🚨 Manejo de Errores
- Validación de DNI duplicado
- Manejo de referencias inválidas
- Errores específicos por tipo de operación
- Logs detallados para debugging

## 🔧 Configuración
Variables sugeridas:
```env
PACIENT_MAX_IMAGE_SIZE=5242880
PACIENT_ALLOWED_IMAGE_TYPES=jpeg,png,gif,webp
PACIENT_DEFAULT_SUCURSAL=JLBYR
```

## 🔗 Integraciones
- **Login**: Autenticación y auditoría
- **Cloudflare**: Gestión de imágenes
- **Services**: Validación de servicios médicos
- **Staff**: Validación de personal médico
- **Branch**: Validación de sucursales

## 📈 Flujo de Trabajo

### Registro de Paciente
1. Validación de DNI único
2. Creación del paciente
3. Creación automática de historia médica
4. Subida de imagen (opcional)
5. Registro de auditoría

### Actualización de Historia
1. Validación de referencias (servicio, personal, sucursal)
2. Creación de la actualización
3. Subida de imágenes (opcional)
4. Asociación con historia médica
5. Registro de auditoría

### Creación de Receta
1. Validación de referencias
2. Creación de la receta
3. Actualización del historial
4. Registro de auditoría

---

## 📚 Documentación de Submódulos

Cada submódulo tiene su propia documentación técnica detallada:

- **👤 Submódulo Pacient**: `src/pacient/README.md`
  - Gestión principal de pacientes
  - Registro, actualización y búsqueda

- **📋 Submódulo History**: `src/history/README.md`
  - Gestión de historias médicas
  - Datos clínicos y antecedentes

- **💊 Submódulo Recipe**: `src/recipe/README.md`
  - Gestión de recetas médicas
  - Medicamentos y servicios prescritos

- **📝 Submódulo Update History**: `src/update-history/README.md`
  - Actualizaciones de historias clínicas
  - Gestión de imágenes médicas

---

Documentación del módulo Pacient - Sistema API Juan Pablo II
