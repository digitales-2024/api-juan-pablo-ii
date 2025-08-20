# 📋 Submódulo History - Documentación Técnica

## 🎯 Descripción General

El submódulo **History** gestiona las **historias médicas** de los pacientes del centro médico. Proporciona funcionalidades para crear, actualizar y consultar historias clínicas completas, incluyendo datos médicos estructurados, antecedentes, alergias y evolución del paciente. Integra con el sistema de auditoría y maneja la actualización automática de datos del paciente.

## 🏗️ Arquitectura del Submódulo

### Estructura de Directorios
```
📁 libs/pacient/src/history/
├── 📁 controllers/          # Controladores REST
│   └── history.controller.ts        # Endpoints de historias médicas
├── 📁 dto/                 # Data Transfer Objects
│   ├── create-history.dto.ts
│   ├── update-history.dto.ts
│   ├── delete-history.dto.ts
│   └── index.ts
├── 📁 entities/            # Entidades (Swagger models)
│   └── history.entity.ts
├── 📁 errors/              # Mensajes de error
│   └── errors-history.ts
├── 📁 repositories/        # Acceso a datos
│   └── history.repository.ts
├── 📁 services/            # Lógica de negocio
│   └── history.service.ts
├── 📁 use-cases/           # Casos de uso
│   ├── create-history.use-case.ts
│   ├── update-history.use-case.ts
│   ├── delete-history.use-case.ts
│   ├── reactive-history.use-case.ts
│   └── index.ts
└── README.md               # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture con separación de responsabilidades
- Repository Pattern para acceso a datos
- DTOs con validaciones robustas
- Auditoría automática en todas las operaciones
- Validación de referencias entre entidades
- Soft delete para mantenimiento de historial

## 🔧 Dependencias del Submódulo

### Internas
```typescript
// Dependencias del módulo principal
AuditModule,           // Para auditoría
PrismaService,         // Para acceso a datos
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (autenticación y auditoría)
- `class-validator`, `class-transformer`

## 📊 Modelos de Datos

### Entidad Principal: `MedicalHistory`

```typescript
export class MedicalHistory {
  id: string;                           // UUID único
  patientId: string;                    // ID del paciente (referencia)
  medicalHistory?: Record<string, string>; // Datos médicos estructurados
  description?: string;                 // Descripción adicional
  isActive: boolean;                    // Estado activo/inactivo
}
```

### Entidad Extendida: `UpdateHistoryResponse`

```typescript
export class UpdateHistoryResponse extends MedicalHistory {
  updates?: UpdateHistoryData[];        // Array de actualizaciones
}

export class UpdateHistoryData {
  id: string;                           // ID de la actualización
  service: string;                      // Nombre del servicio
  staff: string;                        // Nombre del personal médico
  branch: string;                       // Nombre de la sucursal
  images?: UpdateHistoryImage[];        // Imágenes asociadas (opcional)
}

export class UpdateHistoryImage {
  id: string;                           // ID de la imagen
  url: string;                          // URL de la imagen
}
```

## 🧾 Tipados (Interfaces, Enums y DTOs)

### DTOs de Entrada

Origen: `libs/pacient/src/history/dto/*.ts`

#### `CreateMedicalHistoryDto`
```typescript
export type MedicalHistoryData = Record<string, string>;

export class CreateMedicalHistoryDto {
  @IsString() @IsNotEmpty()
  patientId: string;                    // ID del paciente (requerido)

  @IsObject() @IsOptional()
  medicalHistory?: MedicalHistoryData;  // Datos médicos estructurados

  @IsString() @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;                 // Descripción adicional
}
```

#### `UpdateMedicalHistoryDto`
```typescript
export class UpdateMedicalHistoryDto extends PartialType(CreateMedicalHistoryDto) {}
```

#### `DeleteMedicalHistoryDto`
```typescript
export class DeleteMedicalHistoryDto {
  @IsArray() @IsString({ each: true })
  ids: string[];                        // Array de IDs a eliminar
}
```

### Entidades (Swagger Models)

Origen: `libs/pacient/src/history/entities/history.entity.ts`

```typescript
export class MedicalHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  @IsOptional()
  medicalHistory?: Record<string, string>;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  isActive: boolean;
}

export class UpdateHistoryImage {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  url: string;
}

export class UpdateHistoryData {
  @ApiProperty()
  branch: string;
  
  @ApiProperty()
  service: string;
  
  @ApiProperty()
  staff: string;

  @ApiProperty({
    type: [UpdateHistoryImage],
    required: false,
  })
  images?: UpdateHistoryImage[];
}

export class UpdateHistoryResponse extends MedicalHistory {
  @ApiProperty({
    type: [UpdateHistoryData],
    required: false,
  })
  @IsOptional()
  updates?: UpdateHistoryData[];
}
```

## 🧱 Repository y Acceso a Datos

### `MedicalHistoryRepository`

Origen: `libs/pacient/src/history/repositories/history.repository.ts`

Extiende `BaseRepository<MedicalHistory>` con métodos específicos:

```typescript
@Injectable()
export class MedicalHistoryRepository extends BaseRepository<MedicalHistory> {
  constructor(prisma: PrismaService) {
    super(prisma, 'medicalHistory');  // Tabla del esquema de prisma
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

  // Obtener datos del servicio por ID
  private async findServiceById(serviceId: string): Promise<{ name: string }> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { name: true },
    });
    return service;
  }

  // Obtener datos del staff por ID
  private async findStaffById(
    staffId: string,
  ): Promise<{ name: string; lastName: string }> {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        name: true,
        lastName: true,
      },
    });
    return staff;
  }

  // Obtener datos de la sucursal por ID
  private async findBranchById(branchId: string): Promise<{ name: string }> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { name: true },
    });
    return branch;
  }

  // Obtener imágenes asociadas a una actualización
  private async findImagesByUpdateHistoryId(
    updateHistoryId: string,
  ): Promise<Array<{ id: string; url: string }>> {
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

    return images.map((img) => ({
      id: img.id,
      url: img.imageUrl,
    }));
  }

  // Obtener actualizaciones de un paciente
  private async findUpdateHistoriesByPatientId(
    patientId: string,
  ): Promise<any[]> {
    return this.prisma.updateHistory.findMany({
      where: {
        patientId,
        isActive: true,
      },
      select: {
        id: true,
        serviceId: true,
        staffId: true,
        branchId: true,
      },
    });
  }

  // Obtener historia médica con actualizaciones e imágenes
  async findOneWithUpdatesAndImages(
    patientId: string,
  ): Promise<UpdateHistoryData[]> {
    try {
      const updateHistories = await this.prisma.updateHistory.findMany({
        where: {
          patientId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          serviceId: true,
          staffId: true,
          branchId: true,
        },
      });

      const updates = [];

      for (const update of updateHistories) {
        const [service, staff, branch] = await Promise.all([
          this.findServiceById(update.serviceId),
          this.findStaffById(update.staffId),
          this.findBranchById(update.branchId),
        ]);

        updates.push({
          id: update.id,
          service: service.name,
          staff: `${staff.name} ${staff.lastName}`,
          branch: branch.name,
        });
      }

      return updates;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Obtener nombre completo del paciente por ID
  async findPatientFullNameById(patientId: string): Promise<string> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        name: true,
        lastName: true,
      },
    });

    if (!patient) {
      throw new Error(`Paciente con ID ${patientId} no encontrado`);
    }

    const { name, lastName } = patient;
    return `${name} ${lastName ?? ''}`.trim();
  }

  // Actualizar nombre completo y DNI en la historia médica
  async updateMedicalHistoryFullName(
    medicalHistoryId: string,
    patientId: string,
    fullName: string,
    dni: string,
  ): Promise<boolean> {
    try {
      const description = 'Paciente con historia medica asignada';

      const medicalHistory = await this.prisma.medicalHistory.findUnique({
        where: { id: medicalHistoryId },
      });

      if (!medicalHistory || medicalHistory.patientId !== patientId) {
        throw new Error(
          `Registro de historia médica no encontrado o el patientId no coincide`,
        );
      }

      await this.prisma.medicalHistory.update({
        where: { id: medicalHistoryId },
        data: {
          fullName,
          dni,
          description: description,
        },
      });

      return true;
    } catch (error) {
      console.error(
        `Error actualizando los datos del paciente en la historia médica con ID ${medicalHistoryId}:`,
        error,
      );
      return false;
    }
  }

  // Obtener nombre completo y DNI del paciente
  async findPatientFullNameByIdDni(
    patientId: string,
  ): Promise<{ fullName: string; dni: string }> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        name: true,
        lastName: true,
        dni: true,
      },
    });

    if (!patient) {
      throw new Error(`Paciente con ID ${patientId} no encontrado`);
    }

    const { name, lastName, dni } = patient;
    const fullName = `${name} ${lastName ?? ''}`.trim();

    return {
      fullName,
      dni: dni || '',
    };
  }
}
```

## 🚀 Casos de Uso

### `CreateMedicalHistoryUseCase`

Origen: `libs/pacient/src/history/use-cases/create-history.use-case.ts`

```typescript
@Injectable()
export class CreateMedicalHistoryUseCase {
  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createMedicalHistoryDto: CreateMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory>> {
    console.log(
      'use case de crear historia',
      createMedicalHistoryDto.medicalHistory,
    );
    
    const newMedicalHistory = await this.medicalHistoryRepository.transaction(
      async () => {
        // Crear historia médica
        const medicalHistory = await this.medicalHistoryRepository.create({
          patientId: createMedicalHistoryDto.patientId,
          medicalHistory: createMedicalHistoryDto.medicalHistory,
          description: createMedicalHistoryDto.description,
          isActive: true,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: medicalHistory.id,
          entityType: 'medicalHistory',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return medicalHistory;
      },
    );

    return {
      success: true,
      message: 'Historia médica creada exitosamente',
      data: newMedicalHistory,
    };
  }
}
```

### `UpdateMedicalHistoryUseCase`

Origen: `libs/pacient/src/history/use-cases/update-history.use-case.ts`

```typescript
@Injectable()
export class UpdateMedicalHistoryUseCase {
  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updateMedicalHistoryDto: UpdateMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory>> {
    const updatedMedicalHistory =
      await this.medicalHistoryRepository.transaction(async () => {
        // Actualizar historia médica
        const medicalHistory = await this.medicalHistoryRepository.update(id, {
          patientId: updateMedicalHistoryDto.patientId,
          medicalHistory: updateMedicalHistoryDto.medicalHistory,
          description: updateMedicalHistoryDto.description,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: medicalHistory.id,
          entityType: 'medicalHistory',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return medicalHistory;
      });

    return {
      success: true,
      message: 'Historia médica actualizada exitosamente',
      data: updatedMedicalHistory,
    };
  }
}
```

### `DeleteMedicalHistoriesUseCase`

Origen: `libs/pacient/src/history/use-cases/delete-history.use-case.ts`

```typescript
@Injectable()
export class DeleteMedicalHistoriesUseCase {
  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deleteMedicalHistoriesDto: DeleteMedicalHistoryDto,
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory[]>> {
    const deletedHistories = await this.medicalHistoryRepository.transaction(
      async () => {
        // Realizar soft delete
        const histories = await this.medicalHistoryRepository.softDeleteMany(
          deleteMedicalHistoriesDto.ids,
        );

        // Registrar auditoría para cada historia eliminada
        await Promise.all(
          histories.map((history) =>
            this.auditService.create({
              entityId: history.id,
              entityType: 'medicalHistory',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return histories;
      },
    );

    return {
      success: true,
      message: 'Historias médicas eliminadas exitosamente',
      data: deletedHistories,
    };
  }
}
```

### `ReactivateMedicalHistoryUseCase`

Origen: `libs/pacient/src/history/use-cases/reactive-history.use-case.ts`

```typescript
@Injectable()
export class ReactivateMedicalHistoryUseCase {
  constructor(
    private readonly medicalHistoryRepository: MedicalHistoryRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<MedicalHistory[]>> {
    const reactivatedHistories =
      await this.medicalHistoryRepository.transaction(async () => {
        const histories =
          await this.medicalHistoryRepository.reactivateMany(ids);

        // Registrar auditoría para cada historia reactivada
        await Promise.all(
          histories.map((history) =>
            this.auditService.create({
              entityId: history.id,
              entityType: 'medicalHistory',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return histories;
      });

    return {
      success: true,
      message: 'Historias médicas reactivadas exitosamente',
      data: reactivatedHistories,
    };
  }
}
```

## 📡 Endpoints API

### Base Path: `/api/v1/medical-history`

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| `POST` | `/` | Crear historia médica | `CreateMedicalHistoryDto` | `BaseApiResponse<MedicalHistory>` |
| `GET` | `/` | Listar todas | - | `MedicalHistory[]` |
| `GET` | `/:id` | Obtener por ID | - | `MedicalHistory` |
| `GET` | `/:id/complete` | Obtener completa | - | `UpdateHistoryResponse` |
| `PATCH` | `/:id` | Actualizar | `UpdateMedicalHistoryDto` | `BaseApiResponse<MedicalHistory>` |
| `DELETE` | `/remove/all` | Eliminar múltiples | `DeleteMedicalHistoryDto` | `BaseApiResponse<MedicalHistory[]>` |
| `PATCH` | `/reactivate/all` | Reactivar múltiples | `DeleteMedicalHistoryDto` | `BaseApiResponse<MedicalHistory[]>` |

### Detalles de Endpoints

#### Crear Historia Médica
```typescript
@Post()
@ApiOperation({ summary: 'Crear nueva historia médica' })
@ApiResponse({
  status: 201,
  description: 'Historia médica creada exitosamente',
  type: BaseApiResponse<MedicalHistory>,
})
create(
  @Body() createMedicalHistoryDto: CreateMedicalHistoryDto,
  @GetUser() user: UserData,
): Promise<BaseApiResponse<MedicalHistory>>
```

#### Obtener Historia Completa
```typescript
@Get(':id/complete')
@ApiOperation({ summary: 'Obtener historia médica completa por ID' })
@ApiParam({ name: 'id', description: 'ID de la historia médica' })
@ApiResponse({
  status: 200,
  description: 'Historia médica encontrada con actualizaciones e imágenes',
  type: UpdateHistoryResponse,
})
async findOneComplete(@Param('id') id: string): Promise<UpdateHistoryResponse>
```

#### Obtener Nombre del Paciente
```typescript
// Función auxiliar para obtener nombre completo del paciente
async getPatientFullName(id: string): Promise<{ fullName: string }> {
  const fullName = await this.medicalHistoryRepository.findPatientFullNameById(id);
  if (!fullName) {
    throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
  }
  return { fullName };
}
```

## 🔒 Seguridad y Validaciones

### Decoradores de Seguridad
- `@Auth()`: Autenticación requerida
- `@GetUser()`: Obtener datos del usuario autenticado

### Validaciones de Negocio
- **Paciente Existente**: Validación de que el paciente existe antes de crear historia
- **Referencias Válidas**: Validación de todas las entidades referenciadas
- **Datos Médicos**: Estructura flexible para datos médicos

### Manejo de Errores
```typescript
// Mensajes de error específicos
export const historyErrorMessages: ErrorMessages = {
  notFound: 'Historia médica no encontrada',
  alreadyExists: 'La historia médica ya existe',
  invalidData: 'Datos de la historia médica inválidos',
  notActive: 'La historia médica no está activa',
  alreadyActive: 'La historia médica ya está activa',
  inUse: 'La historia médica está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la historia médica',
};
```

## 🔧 Servicios Especializados

### Validación de Referencias
```typescript
// Validar que el paciente existe
private async validateReferences(
  dto: CreateMedicalHistoryDto | UpdateMedicalHistoryDto,
) {
  const patientExists = await this.medicalHistoryRepository.findByIdValidate(
    TABLE_NAMES.PATIENT,
    dto.patientId,
  );
  if (!patientExists) {
    throw new BadRequestException('Paciente no encontrado');
  }
}
```

### Actualización Automática de Datos
```typescript
// Actualizar nombre completo y DNI automáticamente
const { fullName, dni } = await this.medicalHistoryRepository.findPatientFullNameByIdDni(
  createMedicalHistoryDto.patientId,
);

const updateSuccess = await this.medicalHistoryRepository.updateMedicalHistoryFullName(
  medicalHistory.data.id,
  createMedicalHistoryDto.patientId,
  fullName,
  dni,
);
```

## 📊 Funcionalidades Especiales

### Historia Médica Completa
- Incluye todas las actualizaciones del paciente
- Datos de servicios, personal médico y sucursales
- Imágenes asociadas (cuando están disponibles)
- Ordenadas por fecha de creación (más recientes primero)

### Estructura de Datos Médicos
```typescript
// Ejemplo de datos médicos estructurados
const medicalHistoryData = {
  antecedentes: 'No relevant history',
  alergias: 'None known',
  enfermedadesCronicas: ['Hypertension'],
  cirugiasPrevias: ['Appendectomy 2018'],
  medicamentosActuales: ['Aspirin 100mg daily'],
  habitos: 'Non-smoker, occasional alcohol',
  antecedentesFamiliares: 'Father: diabetes, Mother: hypertension'
};
```

## 🧪 Testing Recomendado

### Unit Tests
- Validación de referencias de paciente
- Creación y actualización de historias médicas
- Casos de uso de auditoría
- Manejo de datos médicos estructurados

### Integration Tests
- Endpoints con autenticación
- Validaciones de referencias
- Obtención de historias completas
- Actualización automática de datos

### E2E Tests
- Flujo completo de creación de historia
- Obtención de historia con actualizaciones
- Eliminación y reactivación
- Validación de datos del paciente

## 🚨 Manejo de Errores

### Errores Comunes
- **Paciente No Encontrado**: `BadRequestException('Paciente no encontrado')`
- **Historia No Encontrada**: `BadRequestException('Historia médica no encontrada')`
- **Error de Actualización**: `Error('Error al actualizar el nombre completo del paciente en la historia médica')`
- **Referencia Inválida**: `BadRequestException('Referencia inválida')`

### Logs y Debugging
```typescript
private readonly logger = new Logger(MedicalHistoryService.name);
private readonly errorHandler: BaseErrorHandler;

// Manejo centralizado de errores
this.errorHandler.handleError(error, 'creating');
```

## 🔗 Integraciones

### Módulos Dependientes
- **AuditModule**: Auditoría automática
- **PrismaService**: Acceso a datos
- **PacientModule**: Validación de pacientes

### Flujo de Integración
1. **Creación de Historia** → **Validación de Paciente** → **Auditoría**
2. **Actualización** → **Validación de Referencias** → **Auditoría**
3. **Historia Completa** → **Consulta de Actualizaciones** → **Datos Enriquecidos**

---

Documentación del submódulo History - Sistema API Juan Pablo II
