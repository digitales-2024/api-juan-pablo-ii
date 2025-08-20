# 📝 Submódulo Update History - Documentación Técnica

## 🎯 Descripción General

El submódulo **Update History** gestiona las **actualizaciones de historias clínicas** de los pacientes del centro médico. Proporciona funcionalidades para crear, actualizar y consultar actualizaciones de historias médicas, incluyendo diagnóstico, tratamiento, descanso médico y gestión de imágenes médicas. Integra con el sistema de auditoría y Cloudflare para el manejo de archivos.

## 🏗️ Arquitectura del Submódulo

### Estructura de Directorios
```
📁 libs/pacient/src/update-history/
├── 📁 controllers/          # Controladores REST
│   ├── up-history.controller.ts       # Endpoints de actualizaciones
│   └── format-data.interceptor.ts     # Interceptor para formateo de datos
├── 📁 dto/                 # Data Transfer Objects
│   ├── create-up-history.dto.ts
│   ├── update-up-history.dto.ts
│   ├── delete-up-history.dto.ts
│   └── index.ts
├── 📁 entities/            # Entidades (Swagger models)
│   └── up-history.entity.ts
├── 📁 errors/              # Mensajes de error
│   └── errors-up-history.ts
├── 📁 repositories/        # Acceso a datos
│   └── up-history.repository.ts
├── 📁 services/            # Lógica de negocio
│   └── up-history.service.ts
├── 📁 use-cases/           # Casos de uso
│   ├── create-up-history.use-case.ts
│   ├── update-up-history.use-case.ts
│   ├── delete-up-history.use-case.ts
│   ├── reactive-up-history.use-case.ts
│   └── index.ts
└── README.md               # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture con separación de responsabilidades
- Repository Pattern para acceso a datos
- DTOs con validaciones robustas
- Auditoría automática en todas las operaciones
- Gestión de imágenes con Cloudflare
- Soft delete para mantenimiento de historial

## 🔧 Dependencias del Submódulo

### Internas
```typescript
// Dependencias del módulo principal
AuditModule,           // Para auditoría
CloudflareModule,      // Para gestión de imágenes
PrismaService,         // Para acceso a datos
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@nestjs/platform-express` (FilesInterceptor, FileFieldsInterceptor)
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (autenticación y auditoría)
- `class-validator`, `class-transformer`
- `CloudflareService` (para subida de imágenes)

## 📊 Modelos de Datos

### Entidad Principal: `UpdateHistory`

```typescript
export class UpdateHistory {
  id: string;                           // UUID único
  patientId: string;                    // ID del paciente
  serviceId: string;                    // ID del servicio médico
  staffId: string;                      // ID del personal médico
  branchId: string;                     // ID de la sucursal
  medicalHistoryId: string;             // ID de la historia médica
  prescription: boolean;                // Indica si tiene receta
  prescriptionId?: string;              // ID de la receta (opcional)
  updateHistory: any;                   // Datos de la actualización
  description?: string;                 // Descripción adicional
  medicalLeave: boolean;                // Indica si requiere descanso
  medicalLeaveStartDate?: string;       // Fecha inicio descanso
  medicalLeaveEndDate?: string;         // Fecha fin descanso
  medicalLeaveDays?: number;            // Días de descanso
  leaveDescription?: string;            // Descripción del descanso
  isActive: boolean;                    // Estado activo/inactivo
  createdAt: string;                    // Fecha de creación
  updatedAt: string;                    // Fecha de actualización
}
```

### Interfaz para Imágenes: `CreateImagePatientData`

```typescript
export interface CreateImagePatientData {
  patientId?: string;                   // ID del paciente
  imageUrl?: string;                    // URL de la imagen
  updateHistoryId?: string;             // ID de la actualización
  phothography?: boolean;               // Indica si es fotografía
}
```

## 🧾 Tipados (Interfaces, Enums y DTOs)

### DTOs de Entrada

Origen: `libs/pacient/src/update-history/dto/*.ts`

#### `CreateUpdateHistoryDto`
```typescript
export class CreateUpdateHistoryDto {
  @IsString() @IsNotEmpty()
  patientId: string;                    // ID del paciente

  @IsString() @IsNotEmpty()
  serviceId: string;                    // ID del servicio

  @IsString() @IsNotEmpty()
  staffId: string;                      // ID del personal médico

  @IsString() @IsNotEmpty()
  branchId: string;                     // ID de la sucursal

  @IsString() @IsNotEmpty()
  medicalHistoryId: string;             // ID de la historia médica

  @IsBoolean() @IsOptional()
  prescription?: boolean;               // Indica si tiene receta

  @IsString() @IsOptional()
  prescriptionId?: string;              // ID de la receta

  @IsObject() @IsOptional()
  updateHistory: any;                   // Datos de la actualización

  @IsString() @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;                 // Descripción

  @IsBoolean() @IsOptional()
  medicalLeave?: boolean;               // Indica si requiere descanso

  @IsString() @IsOptional()
  medicalLeaveStartDate?: string;       // Fecha inicio descanso

  @IsString() @IsOptional()
  medicalLeaveEndDate?: string;         // Fecha fin descanso

  @IsOptional()
  medicalLeaveDays?: number;            // Días de descanso

  @IsString() @IsOptional()
  @Transform(({ value }) => value?.trim())
  leaveDescription?: string;            // Descripción del descanso
}
```

#### `UpdateUpdateHistoryDto`
```typescript
export class UpdateUpdateHistoryDto extends PartialType(CreateUpdateHistoryDto) {}
```

#### `DeleteUpdateHistoryDto`
```typescript
export class DeleteUpdateHistoryDto {
  @IsArray() @IsString({ each: true })
  ids: string[];                        // Array de IDs a eliminar
}
```

### Interceptor: `FormatDataInterceptor`

Origen: `libs/pacient/src/update-history/controllers/format-data.interceptor.ts`

```typescript
@Injectable()
export class FormatDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Formatear campos booleanos
    if (request.body.prescription) {
      request.body.prescription = request.body.prescription === 'true';
    }
    if (request.body.medicalLeave) {
      request.body.medicalLeave = request.body.medicalLeave === 'true';
    }

    // Formatear campo updateHistory (JSON)
    if (request.body.updateHistory) {
      try {
        request.body.updateHistory = JSON.parse(request.body.updateHistory);
      } catch {
        throw new BadRequestException(
          'updateHistory must be a valid JSON object',
        );
      }
    }

    // Formatear campo medicalLeaveDays (número)
    if (request.body.medicalLeaveDays) {
      request.body.medicalLeaveDays = Number(request.body.medicalLeaveDays);
      if (isNaN(request.body.medicalLeaveDays)) {
        throw new BadRequestException(
          'medicalLeaveDays must be a valid number',
        );
      }
    }

    // Eliminar propiedad imageUpdates si no hay datos
    if (!request.body.imageUpdates) {
      delete request.body.imageUpdates;
    }

    return next.handle();
  }
}
```

### Entidades (Swagger Models)

Origen: `libs/pacient/src/update-history/entities/up-history.entity.ts`

```typescript
export class UpdateHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  medicalHistoryId: string;

  @ApiProperty()
  prescription: boolean;

  @ApiProperty()
  prescriptionId?: string;

  @ApiProperty()
  updateHistory: any;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  medicalLeave: boolean;

  @ApiProperty()
  medicalLeaveStartDate?: string;

  @ApiProperty()
  medicalLeaveEndDate?: string;

  @ApiProperty()
  medicalLeaveDays?: number;

  @ApiProperty()
  leaveDescription?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
```

## 🧱 Repository y Acceso a Datos

### `UpdateHistoryRepository`

Origen: `libs/pacient/src/update-history/repositories/up-history.repository.ts`

Extiende `BaseRepository<UpdateHistory>` con métodos específicos:

```typescript
@Injectable()
export class UpdateHistoryRepository extends BaseRepository<UpdateHistory> {
  constructor(prisma: PrismaService) {
    super(prisma, 'updateHistory');  // Tabla del esquema de prisma
  }

  // Validar existencia de registro en tabla específica
  async findByIdValidate(table: string, id: string): Promise<boolean> {
    const result = await this.prisma.measureQuery(`findBy${table}Id`, () =>
      (this.prisma[table] as any).findUnique({
        where: { id },
      }),
    );
    return !!result;
  }

  // Crear registro de imagen de paciente
  async createImagePatient(data: CreateImagePatientData): Promise<boolean> {
    try {
      const result = await this.prisma.imagePatient.create({
        data: {
          patientId: data.patientId,
          imageUrl: data.imageUrl,
          updateHistoryId: data.updateHistoryId,
          phothography: data.phothography ?? true,
        },
      });
      return !!result.id;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // Obtener imágenes por ID de historia
  async findImagesByHistoryId(
    updateHistoryId: string,
  ): Promise<Array<{ id: string; url: string }>> {
    try {
      const images = await this.prisma.imagePatient.findMany({
        where: {
          updateHistoryId,
          isActive: true,
        },
        select: {
          id: true,
          imageUrl: true,
        },
      });

      return images
        .map((img) => ({
          id: img.id,
          url: img.imageUrl,
        }))
        .filter((img) => img.url);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // Actualizar URL de imagen existente
  async updateImageUrl(imageId: string, newUrl: string): Promise<boolean> {
    try {
      const result = await this.prisma.imagePatient.update({
        where: {
          id: imageId,
          isActive: true,
        },
        data: {
          imageUrl: newUrl,
          updatedAt: new Date(),
        },
      });
      return !!result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // Buscar imagen por ID
  async findImageById(imageId: string) {
    try {
      return await this.prisma.imagePatient.findUnique({
        where: { id: imageId },
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
```

## 🚀 Casos de Uso

### `CreateUpdateHistoryUseCase`

Origen: `libs/pacient/src/update-history/use-cases/create-up-history.use-case.ts`

```typescript
@Injectable()
export class CreateUpdateHistoryUseCase {
  constructor(
    private readonly updateHistoryRepository: UpdateHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createUpdateHistoryDto: CreateUpdateHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory>> {
    const newUpdateHistory = await this.updateHistoryRepository.transaction(
      async () => {
        // Crear actualización de historia
        const updateHistory = await this.updateHistoryRepository.create({
          serviceId: createUpdateHistoryDto.serviceId,
          patientId: createUpdateHistoryDto.patientId,
          staffId: createUpdateHistoryDto.staffId,
          branchId: createUpdateHistoryDto.branchId,
          medicalHistoryId: createUpdateHistoryDto.medicalHistoryId,
          prescription: createUpdateHistoryDto.prescription,
          prescriptionId: createUpdateHistoryDto.prescriptionId,
          updateHistory: createUpdateHistoryDto.updateHistory,
          description: createUpdateHistoryDto.description,
          medicalLeave: createUpdateHistoryDto.medicalLeave,
          medicalLeaveStartDate: createUpdateHistoryDto.medicalLeaveStartDate,
          medicalLeaveEndDate: createUpdateHistoryDto.medicalLeaveEndDate,
          medicalLeaveDays: createUpdateHistoryDto.medicalLeaveDays,
          leaveDescription: createUpdateHistoryDto.leaveDescription,
          isActive: true,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: updateHistory.id,
          entityType: 'updateHistory',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return updateHistory;
      },
    );

    return {
      success: true,
      message: 'Actualización de historia médica creada exitosamente',
      data: newUpdateHistory,
    };
  }
}
```

### `UpdateUpdateHistoryUseCase`

Origen: `libs/pacient/src/update-history/use-cases/update-up-history.use-case.ts`

```typescript
@Injectable()
export class UpdateUpdateHistoryUseCase {
  constructor(
    private readonly updateHistoryRepository: UpdateHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateUpdateHistoryDto: UpdateUpdateHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory>> {
    const updatedUpdateHistory = await this.updateHistoryRepository.transaction(
      async () => {
        // Actualizar historia médica
        const updateHistory = await this.updateHistoryRepository.update(id, {
          serviceId: updateUpdateHistoryDto.serviceId,
          patientId: updateUpdateHistoryDto.patientId,
          staffId: updateUpdateHistoryDto.staffId,
          branchId: updateUpdateHistoryDto.branchId,
          medicalHistoryId: updateUpdateHistoryDto.medicalHistoryId,
          prescription: updateUpdateHistoryDto.prescription,
          prescriptionId: updateUpdateHistoryDto.prescriptionId,
          updateHistory: updateUpdateHistoryDto.updateHistory,
          description: updateUpdateHistoryDto.description,
          medicalLeave: updateUpdateHistoryDto.medicalLeave,
          medicalLeaveStartDate: updateUpdateHistoryDto.medicalLeaveStartDate,
          medicalLeaveEndDate: updateUpdateHistoryDto.medicalLeaveEndDate,
          medicalLeaveDays: updateUpdateHistoryDto.medicalLeaveDays,
          leaveDescription: updateUpdateHistoryDto.leaveDescription,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: updateHistory.id,
          entityType: 'updateHistory',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return updateHistory;
      },
    );

    return {
      success: true,
      message: 'Actualización de historia médica actualizada exitosamente',
      data: updatedUpdateHistory,
    };
  }
}
```

### `DeleteUpdateHistoriesUseCase`

Origen: `libs/pacient/src/update-history/use-cases/delete-up-history.use-case.ts`

```typescript
@Injectable()
export class DeleteUpdateHistoriesUseCase {
  constructor(
    private readonly updateHistoryRepository: UpdateHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteUpdateHistoriesDto: DeleteUpdateHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory[]>> {
    const deletedUpdateHistories =
      await this.updateHistoryRepository.transaction(async () => {
        // Realizar soft delete
        const updateHistories =
          await this.updateHistoryRepository.softDeleteMany(
            deleteUpdateHistoriesDto.ids,
          );

        // Registrar auditoría para cada actualización eliminada
        await Promise.all(
          updateHistories.map((updateHistory) =>
            this.auditService.create({
              entityId: updateHistory.id,
              entityType: 'updateHistory',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return updateHistories;
      });

    return {
      success: true,
      message: 'Actualizaciones de historia médica eliminadas exitosamente',
      data: deletedUpdateHistories,
    };
  }
}
```

### `ReactivateUpdateHistoryUseCase`

Origen: `libs/pacient/src/update-history/use-cases/reactive-up-history.use-case.ts`

```typescript
@Injectable()
export class ReactivateUpdateHistoryUseCase {
  constructor(
    private readonly updateHistoryRepository: UpdateHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<UpdateHistory[]>> {
    const reactivatedUpdateHistories =
      await this.updateHistoryRepository.transaction(async () => {
        const updateHistories =
          await this.updateHistoryRepository.reactivateMany(ids);

        // Registrar auditoría para cada actualización reactivada
        await Promise.all(
          updateHistories.map((updateHistory) =>
            this.auditService.create({
              entityId: updateHistory.id,
              entityType: 'updateHistory',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return updateHistories;
      });

    return {
      success: true,
      message: 'Actualizaciones de historia médica reactivadas exitosamente',
      data: reactivatedUpdateHistories,
    };
  }
}
```

## 📡 Endpoints API

### Base Path: `/api/v1/update-history`

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| `POST` | `/` | Crear actualización | `CreateUpdateHistoryDto` | `BaseApiResponse<UpdateHistory>` |
| `POST` | `/create-with-images` | Crear con imágenes | `CreateUpdateHistoryDto` + Files | `BaseApiResponse<UpdateHistory & { images }>` |
| `GET` | `/` | Listar todas | - | `UpdateHistory[]` |
| `GET` | `/:id` | Obtener por ID | - | `UpdateHistory` |
| `GET` | `/:id/with-images` | Con imágenes | - | `UpdateHistory & { images }` |
| `PATCH` | `/:id` | Actualizar | `UpdateUpdateHistoryDto` | `BaseApiResponse<UpdateHistory>` |
| `PATCH` | `/:id/update-with-images` | Actualizar con imágenes | `UpdateUpdateHistoryDto` + Files | `BaseApiResponse<UpdateHistory & { images }>` |
| `DELETE` | `/remove/all` | Eliminar múltiples | `DeleteUpdateHistoryDto` | `BaseApiResponse<UpdateHistory[]>` |
| `PATCH` | `/reactivate/all` | Reactivar múltiples | `DeleteUpdateHistoryDto` | `BaseApiResponse<UpdateHistory[]>` |

### Detalles de Endpoints

#### Crear Actualización con Imágenes
```typescript
@Post('create-with-images')
@ApiOperation({ summary: 'Crear actualización de historia médica con imágenes' })
@ApiConsumes('multipart/form-data')
@UseInterceptors(FilesInterceptor('images'), FormatDataInterceptor)
async createWithImages(
  @Body() createUpdateHistoryDto: CreateUpdateHistoryDto,
  @UploadedFiles() images: Express.Multer.File[],
  @GetUser() user: UserData,
): Promise<BaseApiResponse<UpdateHistory & { images }>>
```

#### Actualizar con Imágenes
```typescript
@Patch(':id/update-with-images')
@ApiOperation({ summary: 'Actualizar historia médica con imágenes' })
@ApiConsumes('multipart/form-data')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'newImages', maxCount: 10 },
    { name: 'imageUpdates', maxCount: 10 },
  ]),
  FormatDataInterceptor,
)
async updateWithImages(
  @Param('id') id: string,
  @Body() updateUpdateHistoryDto: UpdateUpdateHistoryDto,
  @UploadedFiles() files: {
    newImages?: Express.Multer.File[];
    imageUpdates?: Express.Multer.File[];
  },
  @Body('imageUpdates') imageUpdateData: string,
  @GetUser() user: UserData,
): Promise<BaseApiResponse<UpdateHistory & { images }>>
```

#### Obtener con Imágenes
```typescript
@Get(':id/with-images')
@ApiOperation({ summary: 'Obtener historia médica con imágenes por ID' })
async findOneWithImages(@Param('id') id: string): Promise<
  UpdateHistory & {
    images: Array<{ id: string; url: string }>;
  }
>
```

## 🔒 Seguridad y Validaciones

### Decoradores de Seguridad
- `@Auth()`: Autenticación requerida
- `@GetUser()`: Obtener datos del usuario autenticado

### Validaciones de Negocio
- **Referencias Válidas**: Validación de servicio, personal, sucursal e historia médica
- **Formato de Imágenes**: Solo JPEG, PNG, GIF, WEBP
- **Datos JSON**: Validación de estructura JSON para updateHistory
- **Fechas de Descanso**: Coherencia entre fechas de inicio y fin

### Manejo de Errores
```typescript
// Mensajes de error específicos
export const upHistoryErrorMessages: ErrorMessages = {
  notFound: 'Actualización de historia médica no encontrada',
  alreadyExists: 'La actualización de historia médica ya existe',
  invalidData: 'Datos de la actualización de historia médica inválidos',
  notActive: 'La actualización de historia médica no está activa',
  alreadyActive: 'La actualización de historia médica ya está activa',
  inUse: 'La actualización de historia médica está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la actualización de historia médica',
};
```

## 🔧 Servicios Especializados

### Gestión de Imágenes
```typescript
// Subir imagen nueva
async uploadImage(image: Express.Multer.File): Promise<HttpResponse<string>>

// Actualizar imagen existente
async updateImage(
  image: Express.Multer.File,
  existingFileName: string,
): Promise<HttpResponse<string>>
```

### Creación con Imágenes
```typescript
// Crear actualización y procesar imágenes
async createWithImages(
  createUpdateHistoryDto: CreateUpdateHistoryDto,
  images: Express.Multer.File[],
  user: UserData,
): Promise<BaseApiResponse<UpdateHistory & { images }>>
```

### Actualización con Imágenes
```typescript
// Actualizar con nuevas imágenes y actualizaciones
async updateWithImages(
  id: string,
  user: UserData,
  updateUpdateHistoryDto: UpdateUpdateHistoryDto,
  newImages?: Express.Multer.File[],
  imageUpdates?: { imageId: string; file: Express.Multer.File }[],
): Promise<BaseApiResponse<UpdateHistory & { images }>>
```

## 📊 Funcionalidades Especiales

### Gestión Completa de Imágenes
- **Nuevas Imágenes**: Subida y asociación automática
- **Actualización de Imágenes**: Reemplazo de imágenes existentes
- **Múltiples Formatos**: Soporte para JPEG, PNG, GIF, WEBP
- **Validación de Tamaño**: Límites configurables
- **Almacenamiento Cloudflare**: URLs seguras y optimizadas

### Formateo Automático de Datos
- **Campos Booleanos**: Conversión de strings a boolean
- **JSON Parsing**: Validación y parseo de objetos JSON
- **Números**: Conversión y validación de campos numéricos
- **Limpieza de Datos**: Eliminación de campos vacíos

### Estructura de Datos de Actualización
```typescript
// Ejemplo de datos de actualización
const updateHistoryData = {
  diagnostico: 'Gripe común',
  tratamiento: 'Reposo y medicamentos',
  observaciones: 'Seguimiento en 7 días',
  sintomas: ['Fiebre', 'Tos', 'Dolor de cabeza'],
  medicamentosRecetados: ['Paracetamol', 'Ibuprofeno'],
  recomendaciones: 'Beber mucha agua y descansar'
};
```

## 🧪 Testing Recomendado

### Unit Tests
- Validación de referencias de entidades
- Creación y actualización de actualizaciones
- Casos de uso de auditoría
- Manejo de imágenes

### Integration Tests
- Endpoints con autenticación
- Validaciones de referencias
- Gestión de archivos
- Formateo de datos

### E2E Tests
- Flujo completo de creación con imágenes
- Actualización de imágenes existentes
- Eliminación y reactivación
- Validación de formatos de archivo

## 🚨 Manejo de Errores

### Errores Comunes
- **Referencia Inválida**: `BadRequestException('Servicio no encontrado')`
- **Imagen Inválida**: `BadRequestException('The file must be an image in JPEG, PNG, GIF, or WEBP format')`
- **JSON Inválido**: `BadRequestException('updateHistory must be a valid JSON object')`
- **Error de Subida**: `InternalServerErrorException('Error subiendo la imagen')`

### Logs y Debugging
```typescript
private readonly logger = new Logger(UpdateHistoryService.name);
private readonly errorHandler: BaseErrorHandler;

// Manejo centralizado de errores
this.errorHandler.handleError(error, 'creating');
```

## 🔗 Integraciones

### Módulos Dependientes
- **AuditModule**: Auditoría automática
- **CloudflareModule**: Gestión de imágenes
- **PrismaService**: Acceso a datos

### Flujo de Integración
1. **Creación de Actualización** → **Validación de Referencias** → **Auditoría** → **Gestión de Imágenes**
2. **Actualización** → **Validación de Cambios** → **Auditoría** → **Actualización de Imágenes**
3. **Consulta con Imágenes** → **Obtención de URLs** → **Datos Enriquecidos**

---

Documentación del submódulo Update History - Sistema API Juan Pablo II
