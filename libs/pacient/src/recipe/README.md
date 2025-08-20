# 💊 Submódulo Recipe - Documentación Técnica

## 🎯 Descripción General

El submódulo **Recipe** gestiona las **recetas médicas** de los pacientes del centro médico. Proporciona funcionalidades para crear, actualizar y consultar prescripciones médicas, incluyendo medicamentos, servicios médicos, dosificación y seguimiento de tratamientos. Integra con el sistema de auditoría y maneja la actualización automática del historial médico.

## 🏗️ Arquitectura del Submódulo

### Estructura de Directorios
```
📁 libs/pacient/src/recipe/
├── 📁 controllers/          # Controladores REST
│   └── recipe.controller.ts        # Endpoints de recetas médicas
├── 📁 dto/                 # Data Transfer Objects
│   ├── create-recipe.dto.ts
│   ├── update-recipe.dto.ts
│   ├── delete-recipe.dto.ts
│   └── index.ts
├── 📁 entities/            # Entidades (Swagger models)
│   └── recipe.entity.ts
├── 📁 errors/              # Mensajes de error
│   └── errors-recipe.ts
├── 📁 repositories/        # Acceso a datos
│   └── recipe.repository.ts
├── 📁 services/            # Lógica de negocio
│   └── recipe.service.ts
├── 📁 use-cases/           # Casos de uso
│   ├── create-recipe.use-case.ts
│   ├── update-recipe.use-case.ts
│   ├── delete-recipe.use-case.ts
│   ├── reactive-recipe.use-case.ts
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
PacientRepository,     // Para consultas de pacientes
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (autenticación y auditoría)
- `class-validator`, `class-transformer`

## 📊 Modelos de Datos

### Entidad Principal: `Prescription`

```typescript
export class Prescription {
  id: string;                           // UUID único
  updateHistoryId: string;              // ID de la actualización de historia
  branchId: string;                     // ID de la sucursal
  staffId: string;                      // ID del personal médico
  patientId: string;                    // ID del paciente
  registrationDate: string;             // Fecha de emisión
  prescriptionMedicaments: PrescriptionItemResponse[]; // Medicamentos
  prescriptionServices: PrescriptionItemResponse[];    // Servicios
  description?: string;                 // Descripción adicional
  purchaseOrderId?: string;             // ID de orden de compra
  isActive: boolean;                    // Estado activo/inactivo
}
```

### Entidad de Items: `PrescriptionItemResponse`

```typescript
export class PrescriptionItemResponse {
  id?: string;                          // ID del item
  name?: string;                        // Nombre del medicamento/servicio
  quantity?: number;                    // Cantidad
  description?: string;                 // Descripción/dosificación
}
```

### Entidad Extendida: `PrescriptionWithPatient`

```typescript
export class PrescriptionWithPatient extends Prescription {
  patient: PrescriptionPatient;         // Datos del paciente
}

export class PrescriptionPatient {
  id: string;                           // ID del paciente
  name: string;                         // Nombre
  lastName?: string;                    // Apellido
  dni: string;                          // DNI
  birthDate: string;                    // Fecha de nacimiento
  gender: string;                       // Género
  address?: string;                     // Dirección
  phone?: string;                       // Teléfono
  email?: string;                       // Email
  isActive: boolean;                    // Estado activo
}
```

## 🧾 Tipados (Interfaces, Enums y DTOs)

### DTOs de Entrada

Origen: `libs/pacient/src/recipe/dto/*.ts`

#### `PrescriptionItemDto`
```typescript
export class PrescriptionItemDto {
  @IsOptional()
  id?: string;                          // ID del item

  @IsOptional()
  name?: string;                        // Nombre

  @IsOptional()
  quantity?: number;                    // Cantidad

  @IsOptional()
  description?: string;                 // Descripción
}
```

#### `CreatePrescriptionDto`
```typescript
export class CreatePrescriptionDto {
  @IsString() @IsNotEmpty()
  updateHistoryId: string;              // ID de actualización de historia

  @IsString() @IsNotEmpty()
  branchId: string;                     // ID de sucursal

  @IsString() @IsNotEmpty()
  staffId: string;                      // ID de personal médico

  @IsString() @IsNotEmpty()
  patientId: string;                    // ID de paciente

  @IsDateString()
  registrationDate: string;             // Fecha de emisión

  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  @IsArray() @IsOptional()
  prescriptionMedicaments?: PrescriptionItemDto[]; // Medicamentos

  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  @IsArray() @IsOptional()
  prescriptionServices?: PrescriptionItemDto[];    // Servicios

  @IsString() @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;                 // Descripción

  @IsString() @IsOptional()
  purchaseOrderId?: string;             // ID de orden de compra
}
```

#### `UpdatePrescriptionDto`
```typescript
export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {}
```

#### `DeletePrescriptionDto`
```typescript
export class DeletePrescriptionDto {
  @IsArray() @IsString({ each: true })
  ids: string[];                        // Array de IDs a eliminar
}
```

### Entidades (Swagger Models)

Origen: `libs/pacient/src/recipe/entities/recipe.entity.ts`

```typescript
export class PrescriptionItemResponse {
  @ApiProperty({ required: false })
  @IsOptional()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;
}

export class Prescription {
  @ApiProperty()
  id: string;

  @ApiProperty()
  updateHistoryId: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  staffId: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty()
  registrationDate: string;

  @ApiProperty({ type: [PrescriptionItemResponse] })
  prescriptionMedicaments: PrescriptionItemResponse[];

  @ApiProperty({ type: [PrescriptionItemResponse] })
  prescriptionServices: PrescriptionItemResponse[];

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  purchaseOrderId?: string;

  @ApiProperty()
  isActive: boolean;
}

export class PrescriptionPatient {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty()
  dni: string;

  @ApiProperty()
  birthDate: string;

  @ApiProperty()
  gender: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  isActive: boolean;
}

export class PrescriptionWithPatient extends Prescription {
  @ApiProperty({ type: PrescriptionPatient })
  patient: PrescriptionPatient;
}
```

## 🧱 Repository y Acceso a Datos

### `PrescriptionRepository`

Origen: `libs/pacient/src/recipe/repositories/recipe.repository.ts`

Extiende `BaseRepository<Prescription>` con métodos específicos:

```typescript
@Injectable()
export class PrescriptionRepository extends BaseRepository<Prescription> {
  constructor(prisma: PrismaService) {
    super(prisma, 'prescription');  // Tabla del esquema de prisma
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

  // Actualizar prescripción en el historial
  async updatePrescriptionInHistory(
    updateHistoryId: string,
    prescriptionId: string,
  ): Promise<boolean> {
    try {
      await this.prisma.updateHistory.update({
        where: { id: updateHistoryId },
        data: { prescriptionId },
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Obtener prescripciones con datos de paciente
  async findPrescriptionsWithPatient(
    limit: number = 10,
    offset: number = 0,
    branchFilter: any = {},
  ): Promise<PrescriptionWithPatient[]> {
    const prescriptions = await this.prisma.prescription.findMany({
      where: {
        isActive: true,
        ...branchFilter,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            lastName: true,
            dni: true,
            birthDate: true,
            gender: true,
            address: true,
            phone: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return prescriptions.map((prescription) => {
      // Convertir JSON a arrays tipados
      const medicaments = this.parseJsonToType<PrescriptionItemResponse[]>(
        prescription.prescriptionMedicaments,
        [],
      );

      const services = this.parseJsonToType<PrescriptionItemResponse[]>(
        prescription.prescriptionServices,
        [],
      );

      // Crear instancia con datos transformados
      return plainToInstance(PrescriptionWithPatient, {
        ...prescription,
        prescriptionMedicaments: medicaments.map((med) =>
          plainToInstance(PrescriptionItemResponse, med),
        ),
        prescriptionServices: services.map((svc) =>
          plainToInstance(PrescriptionItemResponse, svc),
        ),
      });
    });
  }

  // Función auxiliar para parsear JSON
  private parseJsonToType<T>(jsonValue: any, defaultValue: T): T {
    if (!jsonValue) return defaultValue;
    try {
      if (typeof jsonValue === 'string') {
        return JSON.parse(jsonValue);
      }
      return jsonValue as T;
    } catch (error) {
      Logger.error('Error parsing JSON:', error);
      return defaultValue;
    }
  }
}
```

## 🚀 Casos de Uso

### `CreatePrescriptionUseCase`

Origen: `libs/pacient/src/recipe/use-cases/create-recipe.use-case.ts`

```typescript
@Injectable()
export class CreatePrescriptionUseCase {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createPrescriptionDto: CreatePrescriptionDto,
    user: UserData,
  ): Promise<BaseApiResponse<Prescription>> {
    console.log(
      '🚀 ~ CreatePrescriptionUseCase ~ createPrescriptionDto:',
      createPrescriptionDto,
    );
    
    const newPrescription = await this.prescriptionRepository.transaction(
      async () => {
        // Crear prescripción
        const prescription = await this.prescriptionRepository.create({
          updateHistoryId: createPrescriptionDto.updateHistoryId,
          branchId: createPrescriptionDto.branchId,
          staffId: createPrescriptionDto.staffId,
          patientId: createPrescriptionDto.patientId,
          registrationDate: createPrescriptionDto.registrationDate,
          prescriptionMedicaments: createPrescriptionDto.prescriptionMedicaments,
          prescriptionServices: createPrescriptionDto.prescriptionServices,
          description: createPrescriptionDto.description,
          purchaseOrderId: createPrescriptionDto.purchaseOrderId,
          isActive: true,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: prescription.id,
          entityType: 'prescription',
          action: AuditActionType.CREATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return prescription;
      },
    );

    return {
      success: true,
      message: 'Receta médica creada exitosamente',
      data: newPrescription,
    };
  }
}
```

### `UpdatePrescriptionUseCase`

Origen: `libs/pacient/src/recipe/use-cases/update-recipe.use-case.ts`

```typescript
@Injectable()
export class UpdatePrescriptionUseCase {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updatePrescriptionDto: UpdatePrescriptionDto,
    user: UserData,
  ): Promise<BaseApiResponse<Prescription>> {
    const updatedPrescription = await this.prescriptionRepository.transaction(
      async () => {
        // Actualizar prescripción
        const prescription = await this.prescriptionRepository.update(id, {
          updateHistoryId: updatePrescriptionDto.updateHistoryId,
          branchId: updatePrescriptionDto.branchId,
          staffId: updatePrescriptionDto.staffId,
          patientId: updatePrescriptionDto.patientId,
          registrationDate: updatePrescriptionDto.registrationDate,
          prescriptionMedicaments: updatePrescriptionDto.prescriptionMedicaments,
          prescriptionServices: updatePrescriptionDto.prescriptionServices,
          description: updatePrescriptionDto.description,
          purchaseOrderId: updatePrescriptionDto.purchaseOrderId,
          isActive: true,
        });

        // Registrar auditoría
        await this.auditService.create({
          entityId: prescription.id,
          entityType: 'prescription',
          action: AuditActionType.UPDATE,
          performedById: user.id,
          createdAt: new Date(),
        });

        return prescription;
      },
    );

    return {
      success: true,
      message: 'Receta médica actualizada exitosamente',
      data: updatedPrescription,
    };
  }
}
```

### `DeletePrescriptionsUseCase`

Origen: `libs/pacient/src/recipe/use-cases/delete-recipe.use-case.ts`

```typescript
@Injectable()
export class DeletePrescriptionsUseCase {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deletePrescriptionsDto: DeletePrescriptionDto,
    user: UserData,
  ): Promise<BaseApiResponse<Prescription[]>> {
    const deletedPrescriptions = await this.prescriptionRepository.transaction(
      async () => {
        // Realizar soft delete
        const prescriptions = await this.prescriptionRepository.softDeleteMany(
          deletePrescriptionsDto.ids,
        );

        // Registrar auditoría para cada prescripción eliminada
        await Promise.all(
          prescriptions.map((prescription) =>
            this.auditService.create({
              entityId: prescription.id,
              entityType: 'prescription',
              action: AuditActionType.DELETE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return prescriptions;
      },
    );

    return {
      success: true,
      message: 'Recetas médicas eliminadas exitosamente',
      data: deletedPrescriptions,
    };
  }
}
```

### `ReactivatePrescriptionUseCase`

Origen: `libs/pacient/src/recipe/use-cases/reactive-recipe.use-case.ts`

```typescript
@Injectable()
export class ReactivatePrescriptionUseCase {
  constructor(
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Prescription[]>> {
    const reactivatedPrescriptions =
      await this.prescriptionRepository.transaction(async () => {
        const prescriptions =
          await this.prescriptionRepository.reactivateMany(ids);

        // Registrar auditoría para cada prescripción reactivada
        await Promise.all(
          prescriptions.map((prescription) =>
            this.auditService.create({
              entityId: prescription.id,
              entityType: 'prescription',
              action: AuditActionType.UPDATE,
              performedById: user.id,
              createdAt: new Date(),
            }),
          ),
        );

        return prescriptions;
      });

    return {
      success: true,
      message: 'Recetas médicas reactivadas exitosamente',
      data: reactivatedPrescriptions,
    };
  }
}
```

## 📡 Endpoints API

### Base Path: `/api/v1/receta`

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| `POST` | `/` | Crear receta médica | `CreatePrescriptionDto` | `BaseApiResponse<Prescription>` |
| `GET` | `/` | Listar todas | - | `Prescription[]` |
| `GET` | `/patients` | Con pacientes | Query: `limit, offset` | `PatientPrescriptions[]` |
| `GET` | `/withPatient` | Con datos de paciente | Query: `limit, offset` | `PrescriptionWithPatient[]` |
| `GET` | `/patient/:dni` | Por DNI de paciente | - | `PatientPrescriptions` |
| `GET` | `/:id` | Obtener por ID | - | `Prescription` |
| `PATCH` | `/:id` | Actualizar | `UpdatePrescriptionDto` | `BaseApiResponse<Prescription>` |
| `DELETE` | `/remove/all` | Eliminar múltiples | `DeletePrescriptionDto` | `BaseApiResponse<Prescription[]>` |
| `PATCH` | `/reactivate/all` | Reactivar múltiples | `DeletePrescriptionDto` | `BaseApiResponse<Prescription[]>` |

### Detalles de Endpoints

#### Crear Receta Médica
```typescript
@Post()
@ApiOperation({ summary: 'Crear nueva receta médica' })
@ApiResponse({
  status: 201,
  description: 'Receta médica creada exitosamente',
  type: BaseApiResponse<Prescription>,
})
create(
  @Body() createPrescriptionDto: CreatePrescriptionDto,
  @GetUser() user: UserData,
): Promise<BaseApiResponse<Prescription>>
```

#### Obtener Recetas con Pacientes
```typescript
@Get('/withPatient')
@ApiOperation({ summary: 'Obtener receta médica de los pacientes' })
@ApiOkResponse({
  status: 200,
  description: 'Recetas médicas encontrada',
  type: [PrescriptionWithPatient],
})
findByPrescriptionsWithPatients(
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  @GetUserBranch() userBranch?: UserBranchData,
): Promise<PrescriptionWithPatient[]>
```

#### Buscar por DNI de Paciente
```typescript
@Get('/patient/:dni')
@ApiOperation({ summary: 'Obtener receta médica por ID' })
@ApiParam({
  name: 'dni',
  description: 'Número de DNI y deberia tambien el CE',
})
findByPatientIdCard(@Param('dni') dni: string): Promise<PatientPrescriptions>
```

## 🔒 Seguridad y Validaciones

### Decoradores de Seguridad
- `@Auth()`: Autenticación requerida
- `@GetUser()`: Obtener datos del usuario autenticado
- `@GetUserBranch()`: Obtener datos de sucursal del usuario

### Validaciones de Negocio
- **Referencias Válidas**: Validación de updateHistory, sucursal, personal y paciente
- **Datos de Prescripción**: Validación de medicamentos y servicios
- **Filtrado por Sucursal**: Según permisos del usuario

### Manejo de Errores
```typescript
// Mensajes de error específicos
export const recipeErrorMessages: ErrorMessages = {
  notFound: 'Receta médica no encontrada',
  alreadyExists: 'La receta médica ya existe',
  invalidData: 'Datos de la receta médica inválidos',
  notActive: 'La receta médica no está activa',
  alreadyActive: 'La receta médica ya está activa',
  inUse: 'La receta médica está en uso y no puede ser eliminada',
  invalidOperation: 'Operación inválida para la receta médica',
};
```

## 🔧 Servicios Especializados

### Validación de Referencias
```typescript
// Validar todas las referencias antes de crear/actualizar
private async validateReferences(
  dto: CreatePrescriptionDto | UpdatePrescriptionDto,
) {
  // Validar UpdateHistoria
  const updateHistoriaExists = await this.prescriptionRepository.findByIdValidate(
    TABLE_NAMES.UPDATE_HISTORIA,
    dto.updateHistoryId,
  );
  if (!updateHistoriaExists) {
    throw new BadRequestException(
      `Registro de Actualizacion de Historia Médica no encontrado`,
    );
  }

  // Validar Sucursal
  const sucursalExists = await this.prescriptionRepository.findByIdValidate(
    TABLE_NAMES.SUCURSAL,
    dto.branchId,
  );
  if (!sucursalExists) {
    throw new BadRequestException(`Registro de Sucursal no encontrado`);
  }

  // Validar Personal
  const personalExists = await this.prescriptionRepository.findByIdValidate(
    TABLE_NAMES.PERSONAL,
    dto.staffId,
  );
  if (!personalExists) {
    throw new BadRequestException(`Registro de Personal no encontrado`);
  }

  // Validar Paciente
  const pacienteExists = await this.prescriptionRepository.findByIdValidate(
    TABLE_NAMES.PACIENTE,
    dto.patientId,
  );
  if (!pacienteExists) {
    throw new BadRequestException(`Registro de Paciente no encontrado`);
  }
}
```

### Filtrado por Sucursal
```typescript
// Crear filtro basado en el rol del usuario
private createBranchFilter(userBranch?: UserBranchData): any {
  if (
    !userBranch ||
    userBranch.isSuperAdmin ||
    userBranch.rol === 'SUPER_ADMIN' ||
    userBranch.rol === 'MEDICO'
  ) {
    return {};
  }

  if (userBranch.rol === 'ADMINISTRATIVO' && userBranch.branchId) {
    return { branchId: userBranch.branchId };
  }

  return {};
}
```

## 📊 Funcionalidades Especiales

### Prescripciones con Datos de Paciente
- Incluye información completa del paciente
- Transformación automática de JSON a objetos tipados
- Filtrado por sucursal según permisos
- Paginación para grandes volúmenes

### Actualización de Historial
```typescript
// Actualizar el historial con la prescripción creada
const prescriptionId = prescriptionResponse.data.id;
const updateHistoryId = createPrescriptionDto.updateHistoryId;

if (updateHistoryId) {
  await this.prescriptionRepository.updatePrescriptionInHistory(
    updateHistoryId,
    prescriptionId,
  );
}
```

### Estructura de Datos de Prescripción
```typescript
// Ejemplo de prescripción médica
const prescriptionData = {
  updateHistoryId: 'uuid-update-history',
  branchId: 'uuid-branch',
  staffId: 'uuid-staff',
  patientId: 'uuid-patient',
  registrationDate: '2024-03-15',
  prescriptionMedicaments: [
    {
      id: 'uuid-medicament',
      name: 'Paracetamol',
      quantity: 1,
      description: '500mg cada 8 horas por 7 días'
    }
  ],
  prescriptionServices: [
    {
      id: 'uuid-service',
      name: 'Consulta general',
      quantity: 1,
      description: 'Seguimiento en 7 días'
    }
  ],
  description: 'Tratamiento para gripe común',
  purchaseOrderId: 'uuid-order'
};
```

## 🧪 Testing Recomendado

### Unit Tests
- Validación de referencias de entidades
- Creación y actualización de prescripciones
- Casos de uso de auditoría
- Transformación de datos JSON

### Integration Tests
- Endpoints con autenticación
- Validaciones de referencias
- Filtrado por sucursal
- Actualización de historial

### E2E Tests
- Flujo completo de creación de receta
- Búsqueda por DNI de paciente
- Eliminación y reactivación
- Filtrado por permisos de usuario

## 🚨 Manejo de Errores

### Errores Comunes
- **Referencia Inválida**: `BadRequestException('Registro de Actualizacion de Historia Médica no encontrado')`
- **Receta No Encontrada**: `BadRequestException('Receta médica no encontrada')`
- **Error de Transformación**: `Logger.error('Error parsing JSON:', error)`
- **Permisos Insuficientes**: Filtrado automático por sucursal

### Logs y Debugging
```typescript
private readonly logger = new Logger(PrescriptionService.name);
private readonly errorHandler: BaseErrorHandler;

// Manejo centralizado de errores
this.errorHandler.handleError(error, 'creating');
```

## 🔗 Integraciones

### Módulos Dependientes
- **AuditModule**: Auditoría automática
- **PrismaService**: Acceso a datos
- **PacientRepository**: Consultas de pacientes

### Flujo de Integración
1. **Creación de Receta** → **Validación de Referencias** → **Auditoría** → **Actualización de Historial**
2. **Consulta con Pacientes** → **Filtrado por Sucursal** → **Transformación de Datos**
3. **Búsqueda por DNI** → **Consulta de Paciente** → **Prescripciones Asociadas**

---

Documentación del submódulo Recipe - Sistema API Juan Pablo II
```
