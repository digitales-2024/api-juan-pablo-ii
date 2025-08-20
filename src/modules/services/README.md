# 🏥 Módulo Services - Documentación Técnica

## 🎯 Descripción General

El módulo **Services** es el sistema de gestión de servicios médicos del API Juan Pablo II. Maneja la administración completa de servicios médicos y sus tipos, incluyendo la creación, actualización, desactivación y reactivación de ambos. Proporciona funcionalidades CRUD completas con auditoría de cambios y validaciones de negocio específicas para el sector médico.

## 🏗️ Arquitectura del Módulo

### **Estructura de Directorios**
```
📁 services/
├── 📁 controllers/          # Controladores REST
│   ├── service.controller.ts        # Controlador de servicios
│   └── service-type.controller.ts   # Controlador de tipos de servicio
├── 📁 dto/                 # Data Transfer Objects
├── 📁 entities/            # Entidades del dominio
├── 📁 errors/              # Manejo de errores específicos
├── 📁 repositories/        # Capa de acceso a datos
├── 📁 services/            # Lógica de negocio
├── 📁 use-cases/           # Casos de uso específicos
├── service.module.ts       # Configuración del módulo
└── README.md              # Esta documentación
```

### **Patrón Arquitectónico**
- **Clean Architecture** con separación de responsabilidades
- **Use Cases** para operaciones específicas
- **Repository Pattern** para acceso a datos
- **Soft Delete** para desactivación lógica
- **Audit Trail** para seguimiento de cambios
- **Dual Entity Management** (Servicios y Tipos de Servicio)

## 🔧 Dependencias del Módulo

### **Módulos Internos**
```typescript
imports: [
  AuditModule,             // Auditoría de acciones
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

#### **Service (Servicio Médico)**
```typescript
interface Service {
  id: string;              // Identificador único
  name: string;            // Nombre del servicio
  description?: string;    // Descripción del servicio (opcional)
  price: number;           // Precio del servicio
  serviceTypeId: string;   // ID del tipo de servicio
  isActive: boolean;       // Estado activo/inactivo
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de última actualización
}
```

#### **ServiceType (Tipo de Servicio)**
```typescript
interface ServiceType {
  id: string;              // Identificador único
  name: string;            // Nombre del tipo de servicio
  description?: string;    // Descripción del tipo (opcional)
  isActive: boolean;       // Estado activo/inactivo
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de última actualización
}
```

### **DTOs de Entrada**

#### **CreateServiceDto**
```typescript
interface CreateServiceDto {
  name: string;            // Nombre del servicio (requerido)
  description?: string;    // Descripción del servicio (opcional)
  price: number;           // Precio del servicio (requerido, mínimo 0)
  serviceTypeId: string;   // ID del tipo de servicio (requerido)
}
```

#### **UpdateServiceDto**
```typescript
interface UpdateServiceDto {
  name?: string;           // Nombre del servicio (opcional)
  description?: string;    // Descripción del servicio (opcional)
  price?: number;          // Precio del servicio (opcional, mínimo 0)
  serviceTypeId?: string;  // ID del tipo de servicio (opcional)
}
```

#### **CreateServiceTypeDto**
```typescript
interface CreateServiceTypeDto {
  name: string;            // Nombre del tipo de servicio (requerido)
  description?: string;    // Descripción del tipo (opcional)
}
```

#### **UpdateServiceTypeDto**
```typescript
interface UpdateServiceTypeDto {
  name?: string;           // Nombre del tipo de servicio (opcional)
  description?: string;    // Descripción del tipo (opcional)
}
```

#### **DeleteServicesDto / DeleteServiceTypesDto**
```typescript
interface DeleteServicesDto {
  ids: string[];           // Array de IDs de servicios a desactivar
}

interface DeleteServiceTypesDto {
  ids: string[];           // Array de IDs de tipos de servicio a desactivar
}
```

## 🚀 Casos de Uso (Use Cases)

### **Servicios Médicos**

#### **1. CreateServiceUseCase**
**Propósito**: Crear un nuevo servicio médico
**Responsabilidades**:
- Validar que el tipo de servicio existe
- Verificar que no existe otro servicio con el mismo nombre
- Crear servicio en base de datos
- Registrar auditoría de creación

**Flujo**:
1. Validar existencia del tipo de servicio
2. Verificar unicidad del nombre
3. Crear servicio con estado activo
4. Registrar auditoría
5. Retornar respuesta exitosa

#### **2. UpdateServiceUseCase**
**Propósito**: Actualizar un servicio médico existente
**Responsabilidades**:
- Validar que el servicio existe
- Validar tipo de servicio si se proporciona
- Actualizar datos modificados
- Registrar auditoría de cambios

**Flujo**:
1. Validar existencia del servicio
2. Validar tipo de servicio si se actualiza
3. Actualizar datos proporcionados
4. Registrar auditoría
5. Retornar respuesta exitosa

#### **3. DeleteServicesUseCase**
**Propósito**: Desactivar múltiples servicios médicos
**Responsabilidades**:
- Validar array de IDs
- Realizar soft delete de servicios
- Registrar auditoría de desactivación

**Flujo**:
1. Validar array de IDs
2. Desactivar servicios (soft delete)
3. Registrar auditoría para cada uno
4. Retornar respuesta exitosa

#### **4. ReactivateServicesUseCase**
**Propósito**: Reactivar múltiples servicios médicos
**Responsabilidades**:
- Validar array de IDs
- Reactivar servicios desactivados
- Registrar auditoría de reactivación

### **Tipos de Servicio**

#### **1. CreateServiceTypeUseCase**
**Propósito**: Crear un nuevo tipo de servicio
**Responsabilidades**:
- Verificar que no existe otro tipo con el mismo nombre
- Crear tipo de servicio en base de datos
- Registrar auditoría de creación

#### **2. UpdateServiceTypeUseCase**
**Propósito**: Actualizar un tipo de servicio existente
**Responsabilidades**:
- Validar que el tipo existe
- Actualizar datos modificados
- Registrar auditoría de cambios

#### **3. DeleteServiceTypesUseCase**
**Propósito**: Desactivar múltiples tipos de servicio
**Responsabilidades**:
- Validar array de IDs
- Realizar soft delete de tipos
- Registrar auditoría de desactivación

#### **4. ReactivateServiceTypesUseCase**
**Propósito**: Reactivar múltiples tipos de servicio
**Responsabilidades**:
- Validar array de IDs
- Reactivar tipos desactivados
- Registrar auditoría de reactivación

## 📡 Endpoints API

### **Servicios Médicos**

#### **POST /api/v1/services**
**Crear nuevo servicio médico**
```typescript
Body: CreateServiceDto
Response: BaseApiResponse<Service>
```

**Validaciones**:
- `name`: String no vacío, se trima y convierte a minúsculas
- `price`: Número mayor o igual a 0
- `serviceTypeId`: UUID válido de tipo de servicio existente
- `description`: String opcional, se trima y convierte a minúsculas

#### **GET /api/v1/services**
**Obtener todos los servicios**
```typescript
Response: Service[]
```

#### **GET /api/v1/services/:id**
**Obtener servicio por ID**
```typescript
Params: { id: string }
Response: Service
```

#### **PATCH /api/v1/services/:id**
**Actualizar servicio existente**
```typescript
Params: { id: string }
Body: UpdateServiceDto
Response: BaseApiResponse<Service>
```

#### **DELETE /api/v1/services/remove/all**
**Desactivar múltiples servicios**
```typescript
Body: DeleteServicesDto
Response: BaseApiResponse<Service[]>
```

#### **PATCH /api/v1/services/reactivate/all**
**Reactivar múltiples servicios**
```typescript
Body: DeleteServicesDto
Response: BaseApiResponse<Service[]>
```

### **Tipos de Servicio**

#### **POST /api/v1/service-types**
**Crear nuevo tipo de servicio**
```typescript
Body: CreateServiceTypeDto
Response: BaseApiResponse<ServiceType>
```

#### **GET /api/v1/service-types**
**Obtener todos los tipos de servicio**
```typescript
Response: ServiceType[]
```

#### **GET /api/v1/service-types/:id**
**Obtener tipo de servicio por ID**
```typescript
Params: { id: string }
Response: ServiceType
```

#### **PATCH /api/v1/service-types/:id**
**Actualizar tipo de servicio existente**
```typescript
Params: { id: string }
Body: UpdateServiceTypeDto
Response: BaseApiResponse<ServiceType>
```

#### **DELETE /api/v1/service-types/remove/all**
**Desactivar múltiples tipos de servicio**
```typescript
Body: DeleteServiceTypesDto
Response: BaseApiResponse<ServiceType[]>
```

#### **PATCH /api/v1/service-types/reactivate/all**
**Reactivar múltiples tipos de servicio**
```typescript
Body: DeleteServiceTypesDto
Response: BaseApiResponse<ServiceType[]>
```

## 🔒 Seguridad y Autorización

### **Decoradores de Autenticación**
```typescript
@Auth()                    // Requiere autenticación
@GetUser() user: UserData  // Obtiene datos del usuario
```

### **Validaciones de Permisos**
- Solo usuarios autorizados pueden gestionar servicios
- Auditoría de todas las operaciones CRUD
- Validación de datos de entrada específicos del sector médico

## 🔄 Eventos y Notificaciones

### **Eventos del Sistema**
```typescript
// Al crear servicio
ServiceCreatedEvent {
  serviceId: string;
  serviceName: string;
  serviceTypeId: string;
  price: number;
  createdBy: string;
  createdAt: Date;
}

// Al actualizar servicio
ServiceUpdatedEvent {
  serviceId: string;
  changes: Record<string, any>;
  updatedBy: string;
  updatedAt: Date;
}

// Al crear tipo de servicio
ServiceTypeCreatedEvent {
  serviceTypeId: string;
  serviceTypeName: string;
  createdBy: string;
  createdAt: Date;
}
```

### **Integración con Otros Módulos**
- **AuditModule**: Registro de auditoría de todas las operaciones
- **LoginModule**: Autenticación y autorización de usuarios
- **BillingModule**: Referencia para facturación de servicios
- **AppointmentsModule**: Referencia para citas médicas

## 📊 Validaciones de Negocio

### **Reglas de Validación para Servicios**
1. **Nombres**: No pueden estar vacíos, se triman y convierten a minúsculas
2. **Precios**: Deben ser números mayores o iguales a 0
3. **Tipos de Servicio**: Deben existir y estar activos
4. **Unicidad**: No puede haber dos servicios con el mismo nombre
5. **IDs**: Deben ser UUIDs válidos

### **Reglas de Validación para Tipos de Servicio**
1. **Nombres**: No pueden estar vacíos, se triman y convierten a minúsculas
2. **Unicidad**: No puede haber dos tipos con el mismo nombre
3. **IDs**: Deben ser UUIDs válidos

### **Validaciones de Datos**
```typescript
// Ejemplo de validación en DTO
@IsString()
@Transform(({ value }) => value.trim().toLowerCase())
@MinLength(2)
name: string;

@IsNumber()
@Min(0)
price: number;

@IsUUID()
serviceTypeId: string;

@IsArray()
@IsString({ each: true })
ids: string[];
```

## 🗄️ Acceso a Datos

### **Repository Pattern**
```typescript
class ServiceRepository extends BaseRepository<Service> {
  async create(data: CreateServiceData): Promise<Service>
  async findById(id: string): Promise<Service | null>
  async update(id: string, data: UpdateServiceData): Promise<Service>
  async delete(id: string): Promise<void>
  async findMany(): Promise<Service[]>
  async findActiveByType(serviceTypeId: string): Promise<Service[]>
  async findOneWithDetails(id: string): Promise<Service>
  async softDeleteMany(ids: string[]): Promise<Service[]>
  async reactivateMany(ids: string[]): Promise<Service[]>
  async transaction<T>(fn: () => Promise<T>): Promise<T>
}

class ServiceTypeRepository extends BaseRepository<ServiceType> {
  async create(data: CreateServiceTypeData): Promise<ServiceType>
  async findById(id: string): Promise<ServiceType | null>
  async update(id: string, data: UpdateServiceTypeData): Promise<ServiceType>
  async delete(id: string): Promise<void>
  async findMany(): Promise<ServiceType[]>
  async softDeleteMany(ids: string[]): Promise<ServiceType[]>
  async reactivateMany(ids: string[]): Promise<ServiceType[]>
  async transaction<T>(fn: () => Promise<T>): Promise<T>
}
```

### **Queries Principales**
- Búsqueda de servicios por tipo
- Consulta de servicios con detalles completos
- Filtros por estado activo/inactivo
- Operaciones en lote (desactivar/reactivar múltiples)

## 🧪 Testing

### **Tipos de Tests Requeridos**
1. **Unit Tests**: Casos de uso individuales
2. **Integration Tests**: Flujo completo CRUD
3. **E2E Tests**: Endpoints completos
4. **Repository Tests**: Acceso a datos

### **Casos de Prueba Críticos**
- Creación de servicio con tipo válido
- Validación de unicidad de nombres
- Actualización de servicios existentes
- Desactivación de múltiples servicios
- Reactivación de servicios desactivados
- Validación de precios negativos
- Manejo de errores de validación

## 🔧 Configuración

### **Variables de Entorno**
```env
# Configuración de servicios
SERVICE_DEFAULT_STATUS=active
SERVICE_MIN_PRICE=0
SERVICE_NAME_MIN_LENGTH=2

# Configuración de auditoría
AUDIT_ENABLED=true
AUDIT_LOG_LEVEL=info
```

### **Configuración del Módulo**
```typescript
@Module({
  imports: [AuditModule],
  providers: [
    // Repositories
    ServiceRepository,
    ServiceTypeRepository,
    
    // Services
    ServiceService,
    ServiceTypeService,
    
    // Use Cases - Services
    CreateServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    DeleteServicesUseCase,
    ReactivateServicesUseCase,
    
    // Use Cases - Service Types
    CreateServiceTypeUseCase,
    UpdateServiceTypeUseCase,
    DeleteServiceTypesUseCase,
    ReactivateServiceTypesUseCase,
  ],
  controllers: [ServiceController, ServiceTypeController],
  exports: [ServiceService, ServiceTypeService],
})
```

## 📈 Métricas y Monitoreo

### **Métricas Clave**
- Total de servicios activos/inactivos por tipo
- Operaciones CRUD por período
- Tiempo de respuesta de endpoints
- Errores de validación
- Servicios más utilizados

### **Logs Importantes**
- Creación de servicios y tipos
- Actualizaciones de precios
- Desactivaciones y reactivaciones
- Errores de validación
- Auditoría de operaciones

## 🚨 Manejo de Errores

### **Errores Específicos**
```typescript
class ServiceNotFoundError extends Error {
  constructor(serviceId: string) {
    super(`Servicio no encontrado: ${serviceId}`);
  }
}

class ServiceAlreadyExistsError extends Error {
  constructor(serviceName: string) {
    super(`Ya existe un servicio con el nombre '${serviceName}'`);
  }
}

class ServiceTypeNotFoundError extends Error {
  constructor(serviceTypeId: string) {
    super(`Tipo de servicio no encontrado: ${serviceTypeId}`);
  }
}

class ServiceTypeAlreadyExistsError extends Error {
  constructor(serviceTypeName: string) {
    super(`Tipo de servicio con nombre ${serviceTypeName} ya existe`);
  }
}

class InvalidPriceError extends Error {
  constructor(price: number) {
    super(`Precio inválido: ${price}. Debe ser mayor o igual a 0`);
  }
}
```

### **Códigos de Error**
- `400`: Datos de entrada inválidos
- `404`: Servicio/tipo de servicio no encontrado
- `409`: Servicio/tipo de servicio ya existe
- `422`: Datos de validación incorrectos
- `500`: Error interno del servidor

## 🔄 Operaciones en Lote

### **Desactivación Múltiple**
```typescript
// Endpoint: DELETE /api/v1/services/remove/all
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Características**:
- Procesa múltiples servicios en una transacción
- Registra auditoría para cada servicio
- Retorna todos los servicios desactivados
- Manejo de errores individuales

### **Reactivación Múltiple**
```typescript
// Endpoint: PATCH /api/v1/services/reactivate/all
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

## 📊 Transformaciones de Datos

### **Transformaciones Automáticas**
```typescript
// Normalización de strings
@Transform(({ value }) => value.trim().toLowerCase())
name: string;

// Limpieza condicional
@Transform(({ value }) => value?.trim().toLowerCase())
description?: string;
```

### **Validaciones de Formato**
- **Nombres**: Normalización a minúsculas y trim
- **Precios**: Validación de números positivos
- **UUIDs**: Validación de formato UUID
- **Strings**: Limpieza automática de espacios

## 🔍 Funcionalidades Específicas

### **Soft Delete**
- Los servicios y tipos no se eliminan físicamente
- Se marcan como `isActive: false`
- Mantienen su historial completo
- Pueden ser reactivados posteriormente

### **Auditoría Completa**
- Registro de todas las operaciones CRUD
- Información del usuario que realiza la acción
- Timestamp de cada operación
- Tipo de acción realizada

### **Validación de Cambios**
- Detección de cambios reales antes de actualizar
- Optimización de operaciones de base de datos
- Respuesta inmediata si no hay cambios

### **Relaciones entre Entidades**
- Servicios dependen de tipos de servicio válidos
- Validación de integridad referencial
- Consultas con relaciones incluidas

## 🏥 Características Específicas del Sector Médico

### **Gestión de Precios**
- Control de precios de servicios médicos
- Validación de precios mínimos
- Historial de cambios de precios

### **Categorización de Servicios**
- Tipos de servicio para organización
- Filtrado por categorías
- Gestión jerárquica de servicios

### **Integración con Citas**
- Servicios asociados a citas médicas
- Validación de disponibilidad
- Facturación automática

---

*Documentación del módulo Services - Sistema API Juan Pablo II*
