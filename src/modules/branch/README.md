# 🏢 Módulo Branch - Documentación Técnica

## 🎯 Descripción General

El módulo **Branch** es el sistema de gestión de sucursales del API Juan Pablo II. Maneja la administración completa de las diferentes ubicaciones físicas de la institución médica, incluyendo su creación, actualización, desactivación y reactivación. Proporciona funcionalidades CRUD completas con auditoría de cambios.

## 🏗️ Arquitectura del Módulo

### **Estructura de Directorios**
```
📁 branch/
├── 📁 controllers/          # Controladores REST
├── 📁 dto/                 # Data Transfer Objects
├── 📁 entities/            # Entidades del dominio
├── 📁 errors/              # Manejo de errores específicos
├── 📁 repositories/        # Capa de acceso a datos
├── 📁 services/            # Lógica de negocio
├── 📁 use-cases/           # Casos de uso específicos
├── branch.module.ts        # Configuración del módulo
└── README.md              # Esta documentación
```

### **Patrón Arquitectónico**
- **Clean Architecture** con separación de responsabilidades
- **Use Cases** para operaciones específicas
- **Repository Pattern** para acceso a datos
- **Soft Delete** para desactivación lógica
- **Audit Trail** para seguimiento de cambios

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

### **Entidad Principal**

#### **Branch (Sucursal)**
```typescript
interface Branch {
  id: string;              // Identificador único
  name: string;            // Nombre de la sucursal
  address: string;         // Dirección física
  phone?: string;          // Teléfono de contacto (opcional)
  isActive: boolean;       // Estado activo/inactivo
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de última actualización
}
```

### **DTOs de Entrada**

#### **CreateBranchDto**
```typescript
interface CreateBranchDto {
  name: string;            // Nombre de la sucursal (requerido)
  address: string;         // Dirección física (requerido)
  phone?: string;          // Teléfono de contacto (opcional)
}
```

#### **UpdateBranchDto**
```typescript
interface UpdateBranchDto {
  name?: string;           // Nombre de la sucursal (opcional)
  address?: string;        // Dirección física (opcional)
  phone?: string;          // Teléfono de contacto (opcional)
}
```

#### **DeleteBranchesDto**
```typescript
interface DeleteBranchesDto {
  ids: string[];           // Array de IDs de sucursales a desactivar
}
```

## 🚀 Casos de Uso (Use Cases)

### **1. CreateBranchUseCase**
**Propósito**: Crear una nueva sucursal
**Responsabilidades**:
- Validar datos de entrada
- Crear sucursal en base de datos
- Registrar auditoría de creación
- Retornar sucursal creada

**Flujo**:
1. Recibir datos de la sucursal
2. Crear sucursal con estado activo
3. Registrar auditoría
4. Retornar respuesta exitosa

### **2. UpdateBranchUseCase**
**Propósito**: Actualizar una sucursal existente
**Responsabilidades**:
- Validar que la sucursal existe
- Actualizar datos modificados
- Registrar auditoría de cambios
- Retornar sucursal actualizada

**Flujo**:
1. Validar existencia de la sucursal
2. Actualizar datos proporcionados
3. Registrar auditoría
4. Retornar respuesta exitosa

### **3. DeleteBranchesUseCase**
**Propósito**: Desactivar múltiples sucursales
**Responsabilidades**:
- Validar array de IDs
- Realizar soft delete de sucursales
- Registrar auditoría de desactivación
- Retornar sucursales desactivadas

**Flujo**:
1. Validar array de IDs
2. Desactivar sucursales (soft delete)
3. Registrar auditoría para cada una
4. Retornar respuesta exitosa

### **4. ReactivateBranchesUseCase**
**Propósito**: Reactivar múltiples sucursales
**Responsabilidades**:
- Validar array de IDs
- Reactivar sucursales desactivadas
- Registrar auditoría de reactivación
- Retornar sucursales reactivadas

**Flujo**:
1. Validar array de IDs
2. Reactivar sucursales
3. Registrar auditoría para cada una
4. Retornar respuesta exitosa

## 📡 Endpoints API

### **POST /api/v1/branch**
**Crear nueva sucursal**
```typescript
Body: CreateBranchDto
Response: BaseApiResponse<Branch>
```

**Validaciones**:
- `name`: String no vacío, se trima automáticamente
- `address`: String no vacío, se trima automáticamente
- `phone`: Teléfono válido para Perú (opcional)

### **GET /api/v1/branch**
**Obtener todas las sucursales**
```typescript
Response: Branch[]
```

### **GET /api/v1/branch/active**
**Obtener sucursales activas**
```typescript
Response: Branch[]
```

### **GET /api/v1/branch/:id**
**Obtener sucursal por ID**
```typescript
Params: { id: string }
Response: Branch
```

### **PATCH /api/v1/branch/:id**
**Actualizar sucursal existente**
```typescript
Params: { id: string }
Body: UpdateBranchDto
Response: BaseApiResponse<Branch>
```

### **DELETE /api/v1/branch/remove/all**
**Desactivar múltiples sucursales**
```typescript
Body: DeleteBranchesDto
Response: BaseApiResponse<Branch[]>
```

### **PATCH /api/v1/branch/reactivate/all**
**Reactivar múltiples sucursales**
```typescript
Body: DeleteBranchesDto
Response: BaseApiResponse<Branch[]>
```

## 🔒 Seguridad y Autorización

### **Decoradores de Autenticación**
```typescript
@Auth()                    // Requiere autenticación
@GetUser() user: UserData  // Obtiene datos del usuario
```

### **Validaciones de Permisos**
- Solo usuarios autorizados pueden gestionar sucursales
- Auditoría de todas las operaciones CRUD
- Validación de datos de entrada

## 🔄 Eventos y Notificaciones

### **Eventos del Sistema**
```typescript
// Al crear sucursal
BranchCreatedEvent {
  branchId: string;
  branchName: string;
  createdBy: string;
  createdAt: Date;
}

// Al actualizar sucursal
BranchUpdatedEvent {
  branchId: string;
  changes: Record<string, any>;
  updatedBy: string;
  updatedAt: Date;
}

// Al desactivar sucursal
BranchDeactivatedEvent {
  branchId: string;
  deactivatedBy: string;
  deactivatedAt: Date;
}
```

### **Integración con Otros Módulos**
- **AuditModule**: Registro de auditoría de todas las operaciones
- **LoginModule**: Autenticación y autorización de usuarios

## 📊 Validaciones de Negocio

### **Reglas de Validación**
1. **Nombres**: No pueden estar vacíos y se triman automáticamente
2. **Direcciones**: No pueden estar vacías y se triman automáticamente
3. **Teléfonos**: Deben ser válidos para Perú (formato +51XXXXXXXXX)
4. **IDs**: Deben ser UUIDs válidos
5. **Arrays**: Deben contener al menos un elemento

### **Validaciones de Datos**
```typescript
// Ejemplo de validación en DTO
@IsString()
@IsNotEmpty()
@Transform(({ value }) => value.trim())
name: string;

@IsString()
@IsOptional()
@IsPhoneNumber('PE')
@Transform(({ value }) => value?.trim())
phone?: string;

@IsArray()
@IsString({ each: true })
ids: string[];
```

## 🗄️ Acceso a Datos

### **Repository Pattern**
```typescript
class BranchRepository extends BaseRepository<Branch> {
  async create(data: CreateBranchData): Promise<Branch>
  async findById(id: string): Promise<Branch | null>
  async update(id: string, data: UpdateBranchData): Promise<Branch>
  async delete(id: string): Promise<void>
  async findMany(): Promise<Branch[]>
  async findManyActive(): Promise<Branch[]>
  async softDeleteMany(ids: string[]): Promise<Branch[]>
  async reactivateMany(ids: string[]): Promise<Branch[]>
  async transaction<T>(fn: () => Promise<T>): Promise<T>
}
```

### **Queries Principales**
- Búsqueda de sucursales por estado (activas/inactivas)
- Consulta de sucursal por ID
- Operaciones en lote (desactivar/reactivar múltiples)

## 🧪 Testing

### **Tipos de Tests Requeridos**
1. **Unit Tests**: Casos de uso individuales
2. **Integration Tests**: Flujo completo CRUD
3. **E2E Tests**: Endpoints completos
4. **Repository Tests**: Acceso a datos

### **Casos de Prueba Críticos**
- Creación de sucursal con datos válidos
- Actualización de sucursal existente
- Desactivación de múltiples sucursales
- Reactivación de sucursales desactivadas
- Validación de teléfonos peruanos
- Manejo de errores de validación

## 🔧 Configuración

### **Variables de Entorno**
```env
# Configuración de sucursales
BRANCH_DEFAULT_STATUS=active
BRANCH_PHONE_REGION=PE

# Configuración de auditoría
AUDIT_ENABLED=true
AUDIT_LOG_LEVEL=info
```

### **Configuración del Módulo**
```typescript
@Module({
  imports: [AuditModule],
  controllers: [BranchController],
  providers: [
    BranchService,
    BranchRepository,
    CreateBranchUseCase,
    UpdateBranchUseCase,
    DeleteBranchesUseCase,
    ReactivateBranchesUseCase,
  ],
  exports: [BranchService],
})
```

## 📈 Métricas y Monitoreo

### **Métricas Clave**
- Total de sucursales activas/inactivas
- Operaciones CRUD por período
- Tiempo de respuesta de endpoints
- Errores de validación

### **Logs Importantes**
- Creación de sucursales
- Actualizaciones de datos
- Desactivaciones y reactivaciones
- Errores de validación
- Auditoría de operaciones

## 🚨 Manejo de Errores

### **Errores Específicos**
```typescript
class BranchNotFoundError extends Error {
  constructor(branchId: string) {
    super(`Sucursal no encontrada: ${branchId}`);
  }
}

class BranchAlreadyExistsError extends Error {
  constructor(branchName: string) {
    super(`La sucursal ${branchName} ya existe`);
  }
}

class InvalidPhoneNumberError extends Error {
  constructor(phone: string) {
    super(`Número de teléfono inválido: ${phone}`);
  }
}

class BranchInUseError extends Error {
  constructor(branchId: string) {
    super(`La sucursal ${branchId} está en uso y no puede ser eliminada`);
  }
}
```

### **Códigos de Error**
- `400`: Datos de entrada inválidos
- `404`: Sucursal no encontrada
- `409`: Sucursal ya existe
- `422`: Datos de validación incorrectos
- `500`: Error interno del servidor

## 🔄 Operaciones en Lote

### **Desactivación Múltiple**
```typescript
// Endpoint: DELETE /api/v1/branch/remove/all
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Características**:
- Procesa múltiples sucursales en una transacción
- Registra auditoría para cada sucursal
- Retorna todas las sucursales desactivadas
- Manejo de errores individuales

### **Reactivación Múltiple**
```typescript
// Endpoint: PATCH /api/v1/branch/reactivate/all
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Características**:
- Reactiva múltiples sucursales en una transacción
- Registra auditoría para cada sucursal
- Retorna todas las sucursales reactivadas
- Validación de existencia previa

## 📊 Transformaciones de Datos

### **Transformaciones Automáticas**
```typescript
// Limpieza de strings
@Transform(({ value }) => value.trim())
name: string;

// Limpieza condicional
@Transform(({ value }) => value?.trim())
phone?: string;
```

### **Validaciones de Formato**
- **Teléfonos**: Formato peruano (+51XXXXXXXXX)
- **UUIDs**: Validación de formato UUID
- **Strings**: Limpieza automática de espacios

## 🔍 Funcionalidades Específicas

### **Soft Delete**
- Las sucursales no se eliminan físicamente
- Se marcan como `isActive: false`
- Mantienen su historial completo
- Pueden ser reactivadas posteriormente

### **Auditoría Completa**
- Registro de todas las operaciones CRUD
- Información del usuario que realiza la acción
- Timestamp de cada operación
- Tipo de acción realizada

### **Validación de Cambios**
- Detección de cambios reales antes de actualizar
- Optimización de operaciones de base de datos
- Respuesta inmediata si no hay cambios

---

*Documentación del módulo Branch - Sistema API Juan Pablo II*
