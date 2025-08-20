# 👤 Submódulo Pacient - Documentación Técnica

## 🎯 Descripción General

El submódulo **Pacient** gestiona la **información principal de los pacientes** del centro médico. Proporciona funcionalidades completas para el registro, actualización, búsqueda y administración de datos personales de pacientes, incluyendo gestión de imágenes de perfil y KPIs por sucursal. Integra con el sistema de auditoría y maneja la creación automática de historias médicas.

## 🏗️ Arquitectura del Submódulo

### Estructura de Directorios
```
📁 libs/pacient/src/pacient/
├── 📁 controllers/          # Controladores REST
│   ├── pacient.controller.ts        # Endpoints principales de pacientes
│   └── remove-image.interceptor.ts  # Interceptor para manejo de imágenes
├── 📁 dto/                 # Data Transfer Objects
│   ├── create-pacient.dto.ts
│   ├── update-pacient.dto.ts
│   ├── delete-pacient.dto.ts
│   └── index.ts
├── 📁 entities/            # Entidades (Swagger models)
│   └── pacient.entity.ts
├── 📁 errors/              # Mensajes de error
│   └── errors-pacient.ts
├── 📁 repositories/        # Acceso a datos
│   └── pacient.repository.ts
├── 📁 services/            # Lógica de negocio
│   └── pacient.service.ts
├── 📁 use-cases/           # Casos de uso
│   ├── create-pacient.use-case.ts
│   ├── update-pacient.use-case.ts
│   ├── delete-pacient.use-case.ts
│   ├── reactive-pacient.use-case.ts
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
MedicalHistoryService, // Para creación automática de historias
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@nestjs/platform-express` (FileInterceptor)
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (autenticación y auditoría)
- `class-validator`, `class-transformer`
- `CloudflareService` (para subida de imágenes)

## 📊 Modelos de Datos

### Entidad Principal: `Patient`

```typescript
export class Patient {
  id: string;                    // UUID único
  name: string;                  // Nombre completo (requerido)
  lastName?: string;             // Apellido (opcional)
  dni: string;                   // DNI único (requerido)
  birthDate: string;             // Fecha de nacimiento
  gender: string;                // Género (Masculino/Femenino)
  
  // Información de Contacto
  address?: string;              // Dirección
  phone?: string;                // Teléfono
  email?: string;                // Email
  
  // Contacto de Emergencia
  emergencyContact?: string;     // Nombre del contacto
  emergencyPhone?: string;       // Teléfono de emergencia
  
  // Información Médica
  healthInsurance?: string;      // Seguro médico
  bloodType?: string;            // Tipo de sangre (O+, A-, etc.)
  primaryDoctor?: string;        // Médico principal
  
  // Información Personal
  maritalStatus?: string;        // Estado civil
  occupation?: string;           // Ocupación
  workplace?: string;            // Lugar de trabajo
  
  // Información del Sistema
  sucursal?: string;             // Sucursal asignada
  notes?: string;                // Notas adicionales
  patientPhoto?: string;         // URL de la foto
  isActive: boolean;             // Estado activo/inactivo
}
```

### Entidad Extendida: `PatientPrescriptions`

```typescript
export class PatientPrescriptions extends Patient {
  Prescription: Prescription[];  // Array de prescripciones asociadas
}
```

## 🧾 Tipados (Interfaces, Enums y DTOs)

### DTOs de Entrada

Origen: `libs/pacient/src/pacient/dto/*.ts`

#### `CreatePatientDto`
```typescript
export class CreatePatientDto {
  @IsString() @IsNotEmpty() @MaxLength(100)
  @Transform(({ value }) => value.trim())
  name: string;                  // Nombre completo

  @IsString() @IsOptional() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName?: string;             // Apellido

  @IsString() @IsNotEmpty() @MaxLength(12)
  @Transform(({ value }) => value.trim())
  dni: string;                   // DNI único

  @IsString()
  birthDate: string;             // Fecha de nacimiento

  @IsString() @IsNotEmpty()
  gender: string;                // Género

  @IsString() @IsOptional() @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  address?: string;              // Dirección

  @IsString() @IsOptional() @MaxLength(15)
  @Transform(({ value }) => value?.trim())
  phone?: string;                // Teléfono

  @IsString() @IsOptional() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  email?: string;                // Email

  @IsString() @IsOptional() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  emergencyContact?: string;     // Contacto de emergencia

  @IsString() @IsOptional() @MaxLength(15)
  @Transform(({ value }) => value?.trim())
  emergencyPhone?: string;       // Teléfono de emergencia

  @IsString() @IsOptional() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  healthInsurance?: string;      // Seguro médico

  @IsString() @IsOptional() @MaxLength(20)
  @Transform(({ value }) => value?.trim())
  maritalStatus?: string;        // Estado civil

  @IsString() @IsOptional() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  occupation?: string;           // Ocupación

  @IsString() @IsOptional() @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  workplace?: string;            // Lugar de trabajo

  @IsString() @IsOptional() @MaxLength(3)
  @Transform(({ value }) => value?.trim())
  bloodType?: string;            // Tipo de sangre

  @IsString() @IsOptional() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  primaryDoctor?: string;        // Médico principal

  @IsString() @IsOptional() @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  sucursal?: string;             // Sucursal

  @IsString() @IsOptional()
  @Transform(({ value }) => value?.trim())
  notes?: string;                // Notas

  @IsOptional()
  patientPhoto?: string = null;  // Foto del paciente
}
```

#### `UpdatePatientDto`
```typescript
export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  id?: string;                   // ID para actualización
  image?: undefined;             // Excluir campo image
}
```

#### `DeletePatientDto`
```typescript
export class DeletePatientDto {
  @IsArray() @IsString({ each: true })
  ids: string[];                 // Array de IDs a eliminar
}
```

### Interceptor: `RemoveImageInterceptor`

Origen: `libs/pacient/src/pacient/controllers/remove-image.interceptor.ts`

```typescript
@Injectable()
export class RemoveImageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (!request.file) {
      delete request.body.image;  // Elimina campo image si no hay archivo
    }
    return next.handle();
  }
}
```

## 🧱 Repository y Acceso a Datos

### `PacientRepository`

Origen: `libs/pacient/src/pacient/repositories/pacient.repository.ts`

Extiende `BaseRepository<Patient>` con métodos específicos:

```typescript
@Injectable()
export class PacientRepository extends BaseRepository<Patient> {
  constructor(prisma: PrismaService) {
    super(prisma, 'patient');  // Tabla del esquema de prisma
  }

  // Búsqueda por DNI con filtro insensible
  async findPatientByDNI(dni: string): Promise<Patient[]> {
    return this.prisma.patient.findMany({
      where: {
        dni: {
          contains: dni,
          mode: 'insensitive',
        },
      },
      take: 10,
    });
  }

  // Obtener primeros pacientes (para búsqueda rápida)
  async findFirstPatients(limit: number = 10): Promise<Patient[]> {
    return this.prisma.patient.findMany({
      take: limit,
    });
  }

  // Pacientes con prescripciones (para dashboard)
  async findPatientPrescriptions(
    limit: number = 10,
    offset: number = 0,
  ): Promise<PatientPrescriptions[]> {
    const patients = await this.prisma.patient.findMany({
      take: limit,
      skip: offset,
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
        Prescription: true,
      },
    });

    return patients.map((patient) => {
      const transformedPrescriptions = patient.Prescription.map(
        (prescription) => {
          const medicaments = this.parseJsonToType<PrescriptionItemResponse[]>(
            prescription.prescriptionMedicaments,
            [],
          );
          const services = this.parseJsonToType<PrescriptionItemResponse[]>(
            prescription.prescriptionServices,
            [],
          );
          return plainToInstance(Prescription, {
            ...prescription,
            prescriptionMedicaments: medicaments.map((med) =>
              plainToInstance(PrescriptionItemResponse, med),
            ),
            prescriptionServices: services.map((svc) =>
              plainToInstance(PrescriptionItemResponse, svc),
            ),
          });
        },
      );

      return plainToInstance(PatientPrescriptions, {
        ...patient,
        Prescription: transformedPrescriptions,
      });
    });
  }

  // Prescripciones por DNI de paciente
  async findPrescriptionsByPatientDNI(
    dni: string,
  ): Promise<PatientPrescriptions> {
    const patient = await this.prisma.patient.findUniqueOrThrow({
      where: { dni: dni },
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
        Prescription: true,
      },
    });

    const transformedPrescriptions = patient.Prescription.map(
      (prescription) => {
        const medicaments = this.parseJsonToType<PrescriptionItemResponse[]>(
          prescription.prescriptionMedicaments,
          [],
        );
        const services = this.parseJsonToType<PrescriptionItemResponse[]>(
          prescription.prescriptionServices,
          [],
        );
        return plainToInstance(Prescription, {
          ...prescription,
          prescriptionMedicaments: medicaments.map((med) =>
            plainToInstance(PrescriptionItemResponse, med),
          ),
          prescriptionServices: services.map((svc) =>
            plainToInstance(PrescriptionItemResponse, svc),
          ),
        });
      },
    );

    return plainToInstance(PatientPrescriptions, {
      ...patient,
      Prescription: transformedPrescriptions,
    });
  }

  // KPIs de pacientes por sucursal (últimos 12 meses)
  async getPacientesPorSucursal(): Promise<any[]> {
    const ultimoPaciente = await this.prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (!ultimoPaciente) return [];

    const fechaReferencia = new Date(ultimoPaciente.createdAt);
    const startDate = new Date(fechaReferencia);
    startDate.setMonth(fechaReferencia.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const pacientes = await this.prisma.patient.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: fechaReferencia,
        },
      },
      select: {
        createdAt: true,
        sucursal: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Procesamiento de datos para KPIs...
    const ultimos12Meses = [];
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(fechaReferencia);
      fecha.setMonth(fechaReferencia.getMonth() - i);
      const mesIndex = fecha.getMonth();
      const nombreMes = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ][mesIndex];
      ultimos12Meses.push({
        nombre: nombreMes,
        mes: mesIndex,
        año: fecha.getFullYear(),
      });
    }

    ultimos12Meses.reverse();

    const contadorPorMes = {};
    ultimos12Meses.forEach((mesData) => {
      const etiqueta = `${mesData.nombre} ${mesData.año}`;
      contadorPorMes[etiqueta] = {
        JLBYR: 0,
        Yanahuara: 0,
        etiqueta,
      };
    });

    pacientes.forEach((paciente) => {
      const fechaPaciente = new Date(paciente.createdAt);
      const mesPaciente = fechaPaciente.getMonth();
      const añoPaciente = fechaPaciente.getFullYear();
      const mesMatch = ultimos12Meses.find(
        (m) => m.mes === mesPaciente && m.año === añoPaciente,
      );

      if (mesMatch) {
        const etiqueta = `${mesMatch.nombre} ${mesMatch.año}`;
        if (paciente.sucursal === 'JLBYR') {
          contadorPorMes[etiqueta].JLBYR += 1;
        } else if (paciente.sucursal === 'Yanahuara') {
          contadorPorMes[etiqueta].Yanahuara += 1;
        }
      }
    });

    return Object.entries(contadorPorMes).map(([month, counts]) => ({
      month: month.split(' ')[0],
      JLBYR: counts.JLBYR,
      Yanahuara: counts.Yanahuara,
    }));
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

### `CreatePatientUseCase`

Origen: `libs/pacient/src/pacient/use-cases/create-pacient.use-case.ts`

```typescript
@Injectable()
export class CreatePatientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    createPatientDto: CreatePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    const newPatient = await this.pacientRepository.transaction(async () => {
      // Crear paciente
      const patient = await this.pacientRepository.create({
        name: createPatientDto.name,
        lastName: createPatientDto.lastName,
        dni: createPatientDto.dni,
        birthDate: createPatientDto.birthDate,
        gender: createPatientDto.gender,
        address: createPatientDto.address,
        phone: createPatientDto.phone,
        email: createPatientDto.email,
        emergencyContact: createPatientDto.emergencyContact,
        emergencyPhone: createPatientDto.emergencyPhone,
        healthInsurance: createPatientDto.healthInsurance,
        maritalStatus: createPatientDto.maritalStatus,
        occupation: createPatientDto.occupation,
        workplace: createPatientDto.workplace,
        bloodType: createPatientDto.bloodType,
        primaryDoctor: createPatientDto.primaryDoctor,
        sucursal: createPatientDto.sucursal,
        notes: createPatientDto.notes,
        patientPhoto: null,
        isActive: true,
      });

      // Registrar auditoría
      await this.auditService.create({
        entityId: patient.id,
        entityType: 'patient',
        action: AuditActionType.CREATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return patient;
    });

    return {
      success: true,
      message: 'Paciente Creado exitosamente',
      data: newPatient,
    };
  }
}
```

### `UpdatePatientUseCase`

Origen: `libs/pacient/src/pacient/use-cases/update-pacient.use-case.ts`

```typescript
@Injectable()
export class UpdatePatientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    id: string,
    updatePatientDto: UpdatePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient>> {
    const updatedPatient = await this.pacientRepository.transaction(async () => {
      // Actualizar paciente
      const patient = await this.pacientRepository.update(id, {
        name: updatePatientDto.name,
        lastName: updatePatientDto.lastName,
        dni: updatePatientDto.dni,
        birthDate: updatePatientDto.birthDate,
        gender: updatePatientDto.gender,
        address: updatePatientDto.address,
        phone: updatePatientDto.phone,
        email: updatePatientDto.email,
        emergencyContact: updatePatientDto.emergencyContact,
        emergencyPhone: updatePatientDto.emergencyPhone,
        healthInsurance: updatePatientDto.healthInsurance,
        maritalStatus: updatePatientDto.maritalStatus,
        occupation: updatePatientDto.occupation,
        workplace: updatePatientDto.workplace,
        bloodType: updatePatientDto.bloodType,
        primaryDoctor: updatePatientDto.primaryDoctor,
        sucursal: updatePatientDto.sucursal,
        notes: updatePatientDto.notes,
        patientPhoto: updatePatientDto.patientPhoto,
        isActive: true,
      });

      // Registrar auditoría
      await this.auditService.create({
        entityId: patient.id,
        entityType: 'patient',
        action: AuditActionType.UPDATE,
        performedById: user.id,
        createdAt: new Date(),
      });

      return patient;
    });

    return {
      success: true,
      message: 'Paciente Actualizado exitosamente',
      data: updatedPatient,
    };
  }
}
```

### `DeletePatientsUseCase`

Origen: `libs/pacient/src/pacient/use-cases/delete-pacient.use-case.ts`

```typescript
@Injectable()
export class DeletePatientsUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    deletePatientsDto: DeletePatientDto,
    user: UserData,
  ): Promise<BaseApiResponse<Patient[]>> {
    const deletedPatients = await this.pacientRepository.transaction(async () => {
      // Realizar soft delete
      const patients = await this.pacientRepository.softDeleteMany(
        deletePatientsDto.ids,
      );

      // Registrar auditoría para cada paciente eliminado
      await Promise.all(
        patients.map((patient) =>
          this.auditService.create({
            entityId: patient.id,
            entityType: 'paciente',
            action: AuditActionType.DELETE,
            performedById: user.id,
            createdAt: new Date(),
          }),
        ),
      );

      return patients;
    });

    return {
      success: true,
      message: 'Pacientes eliminados exitosamente',
      data: deletedPatients,
    };
  }
}
```

### `ReactivatePacientUseCase`

Origen: `libs/pacient/src/pacient/use-cases/reactive-pacient.use-case.ts`

```typescript
@Injectable()
export class ReactivatePacientUseCase {
  constructor(
    private readonly pacientRepository: PacientRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    ids: string[],
    user: UserData,
  ): Promise<BaseApiResponse<Patient[]>> {
    const reactivatedPatients = await this.pacientRepository.transaction(async () => {
      const patients = await this.pacientRepository.reactivateMany(ids);

      // Registrar auditoría para cada paciente reactivado
      await Promise.all(
        patients.map((patient) =>
          this.auditService.create({
            entityId: patient.id,
            entityType: 'Pacient',
            action: AuditActionType.UPDATE,
            performedById: user.id,
            createdAt: new Date(),
          }),
        ),
      );

      return patients;
    });

    return {
      success: true,
      message: 'Pacientes reactivados exitosamente',
      data: reactivatedPatients,
    };
  }
}
```

## 📡 Endpoints API

### Base Path: `/api/v1/paciente`

| Método | Endpoint | Descripción | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| `POST` | `/` | Crear paciente | `CreatePatientDto` | `BaseApiResponse<Patient>` |
| `POST` | `/create-with-image` | Crear con imagen | `CreatePatientDto` + File | `BaseApiResponse<Patient>` |
| `GET` | `/` | Listar todos | - | `Patient[]` |
| `GET` | `/dni/:dni` | Buscar por DNI | - | `Patient[]` |
| `GET` | `/:id` | Obtener por ID | - | `Patient` |
| `PATCH` | `/:id` | Actualizar | `UpdatePatientDto` | `BaseApiResponse<Patient>` |
| `PATCH` | `/:id/update-with-image` | Actualizar con imagen | `UpdatePatientDto` + File | `BaseApiResponse<Patient>` |
| `DELETE` | `/remove/all` | Eliminar múltiples | `DeletePatientDto` | `BaseApiResponse<Patient[]>` |
| `PATCH` | `/reactivate/all` | Reactivar múltiples | `DeletePatientDto` | `BaseApiResponse<Patient[]>` |
| `GET` | `/dashboard/pacientes-por-sucursal` | KPIs por sucursal | Query: `year?` | `{ data: any[] }` |

### Detalles de Endpoints

#### Crear Paciente
```typescript
@Post()
@ApiOperation({ summary: 'Crear nuevo paciente' })
@ApiResponse({
  status: 201,
  description: 'Paciente creado exitosamente',
  type: BaseApiResponse<Patient>,
})
create(
  @Body() createPatientDto: CreatePatientDto,
  @GetUser() user: UserData,
): Promise<BaseApiResponse<Patient>>
```

#### Crear Paciente con Imagen
```typescript
@Post('create-with-image')
@ApiOperation({ summary: 'Crear nuevo paciente con imagen opcional' })
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileInterceptor('image'), RemoveImageInterceptor)
async createWithImage(
  @Body() createPatientDto: CreatePatientDto,
  @UploadedFile() image: Express.Multer.File,
  @GetUser() user: UserData,
): Promise<BaseApiResponse<Patient>>
```

#### Buscar por DNI
```typescript
@Get('dni/:dni')
@ApiOperation({ summary: 'Obtener un paciente por su dni' })
@ApiParam({ name: 'dni', description: 'DNI del paciente' })
findByDni(@Param('dni') dni: string): Promise<Patient[]>
```

#### KPIs por Sucursal
```typescript
@Get('dashboard/pacientes-por-sucursal')
@ApiOperation({
  summary: 'Obtener datos de pacientes por sucursal para el dashboard',
})
@ApiQuery({
  name: 'year',
  required: false,
  description: 'Año para filtrar los datos (formato: YYYY)',
  type: Number,
})
async getPacientesPorSucursal(@Query('year') yearParam?: string)
```

## 🔒 Seguridad y Validaciones

### Decoradores de Seguridad
- `@Auth()`: Autenticación requerida
- `@GetUser()`: Obtener datos del usuario autenticado
- `@GetUserBranch()`: Obtener datos de sucursal del usuario

### Validaciones de Negocio
- **DNI Único**: Validación de duplicados antes de crear
- **Formato de Imágenes**: Solo JPEG, PNG, GIF, WEBP
- **Tamaño de Archivos**: Límite configurable
- **Campos Requeridos**: Validación con class-validator

### Manejo de Errores
```typescript
// Mensajes de error específicos
export const pacientErrorMessages: ErrorMessages = {
  notFound: 'Paciente no encontrado',
  alreadyExists: 'El paciente ya existe',
  invalidData: 'Datos del paciente inválidos',
  notActive: 'El paciente no está activo',
  alreadyActive: 'El paciente ya está activo',
  inUse: 'El paciente está en uso y no puede ser eliminado',
  invalidOperation: 'Operación inválida para el paciente',
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

### Creación con Historia Médica
```typescript
// Crear paciente y generar historia médica automáticamente
async createPatientWithImage(
  createPatientDto: CreatePatientDto,
  image: Express.Multer.File,
  user: UserData,
): Promise<BaseApiResponse<Patient>>
```

## 📊 KPIs y Métricas

### Datos por Sucursal
- Conteo de pacientes por mes
- Comparación entre sucursales (JLBYR vs Yanahuara)
- Últimos 12 meses desde el registro más reciente
- Formato optimizado para dashboards

### Estructura de Respuesta
```typescript
{
  statusCode: 200,
  message: 'Datos de pacientes por sucursal obtenidos con éxito',
  data: [
    { month: 'Enero', JLBYR: 12, Yanahuara: 8 },
    { month: 'Febrero', JLBYR: 15, Yanahuara: 10 },
    // ... más meses
  ]
}
```

## 🧪 Testing Recomendado

### Unit Tests
- Validación de DNI único
- Creación y actualización de pacientes
- Manejo de imágenes
- Casos de uso de auditoría

### Integration Tests
- Endpoints con autenticación
- Gestión de archivos
- KPIs por sucursal
- Validaciones de referencias

### E2E Tests
- Flujo completo de registro
- Actualización con imágenes
- Búsqueda por DNI
- Eliminación y reactivación

## 🚨 Manejo de Errores

### Errores Comunes
- **DNI Duplicado**: `BadRequestException('Ya existe un paciente con este DNI')`
- **Imagen Inválida**: `BadRequestException('The file must be an image in JPEG, PNG, GIF, or WEBP format')`
- **Paciente No Encontrado**: `BadRequestException('Paciente no encontrado')`
- **Error de Subida**: `InternalServerErrorException('Error subiendo la imagen')`

### Logs y Debugging
```typescript
private readonly logger = new Logger(PacientService.name);
private readonly errorHandler: BaseErrorHandler;

// Manejo centralizado de errores
this.errorHandler.handleError(error, 'creating');
```

## 🔗 Integraciones

### Módulos Dependientes
- **AuditModule**: Auditoría automática
- **CloudflareModule**: Gestión de imágenes
- **MedicalHistoryService**: Creación automática de historias

### Flujo de Integración
1. **Creación de Paciente** → **Historia Médica Automática**
2. **Subida de Imagen** → **Cloudflare Storage**
3. **Auditoría** → **Registro de Acciones**
4. **KPIs** → **Dashboard Analytics**

---

Documentación del submódulo Pacient - Sistema API Juan Pablo II
