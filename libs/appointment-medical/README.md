# 🏥 Módulo Appointment Medical - Documentación Técnica

## 🎯 Descripción General

El módulo **Appointment Medical** gestiona las **citas médicas** desde la perspectiva del personal médico y administrativo. Proporciona funcionalidades para que los médicos vean sus citas confirmadas y completadas, permite actualizar el estado de las citas, y ofrece un dashboard con métricas y KPIs del sistema médico. Integra con el sistema de auditoría para trazabilidad de cambios.

## 🏗️ Arquitectura del Módulo

### Estructura de Directorios
```
📁 libs/appointment-medical/
├── 📁 src/
│   ├── 📁 appointment-user/           # Funcionalidades de citas para usuarios
│   │   ├── 📁 controllers/            # Controladores REST
│   │   ├── 📁 dto/                   # Data Transfer Objects
│   │   ├── 📁 entities/              # Entidades (Swagger models)
│   │   ├── 📁 repositories/          # Acceso a datos
│   │   ├── 📁 services/              # Lógica de negocio
│   │   └── 📁 use-cases/             # Casos de uso
│   ├── doc-appointment.module.ts      # Configuración del módulo
│   └── index.ts                      # Exportaciones
├── tsconfig.lib.json                 # Configuración TypeScript
└── README.md                         # Esta documentación
```

### Patrón Arquitectónico
- Clean Architecture + Repository Pattern
- Casos de uso específicos para actualización de estados
- Auditoría con `AuditModule`
- DTOs fuertemente tipados (TypeScript)
- Separación clara entre lógica de negocio y acceso a datos

## 🔧 Dependencias del Módulo

### Internas
```typescript
@Module({
  imports: [AuditModule],
  controllers: [ApponitmentUserController, DashboardController],
  providers: [
    ApponitmentUserRepository,
    UpdateApponitmentUserUseCase,
    DashboardRepository,
    DashboardService,
    ApponitmentUserService,
  ],
  exports: [ApponitmentUserService, DashboardService],
})
```

### Externas
- `@nestjs/common`, `@nestjs/swagger`
- `@prisma/client` (vía `PrismaService`)
- `@login/login` (para auditoría y autenticación)
- `class-validator`, `class-transformer`

## 📊 Modelos de Datos y Entidades

### Entidad: `AppointmentMedicalResponse`
Campos: `id`, `staffId`, `userId`, `medicalHistoryId`, `patientId`, `status`

### Entidad: `AppointmentResponse`
Campos: `id`, `staff`, `service`, `branch`, `patient`, `start`, `end`, `status`, `medicalHistoryId`

### Estados de Cita
- `CONFIRMED`: Cita confirmada y programada
- `COMPLETED`: Cita completada exitosamente
- `NO_SHOW`: Paciente no se presentó

## 🧾 Tipados (Interfaces, Enums y DTOs)

### DTOs

Origen: `libs/appointment-medical/src/appointment-user/dto/update-apponitment-user.dto.ts`

```typescript
export class UpdateAppointmentUserDto {
  @ApiProperty({
    description: 'Estado de la cita',
    enum: ['COMPLETED', 'NO_SHOW'],
    example: 'COMPLETED',
  })
  @IsEnum(['COMPLETED', 'NO_SHOW'], {
    message: 'El estado debe ser COMPLETED o NO_SHOW',
  })
  status: string;
}
```

### Entidades (Swagger Models)

Origen: `libs/appointment-medical/src/appointment-user/entities/apponitment-user..entity.ts`

```typescript
export class AppointmentMedicalResponse {
  id: string;
  staffId?: number;
  userId?: string;
  medicalHistoryId?: string;
  patientId?: string;
  status?: string;
}

export class AppointmentResponse {
  id: string;
  staff: string;           // Nombre completo del médico
  service: string;         // Nombre del servicio
  branch: string;          // Nombre de la sucursal
  patient: string;         // Nombre completo del paciente
  start: Date;            // Fecha y hora de inicio
  end: Date;              // Fecha y hora de fin
  status: string;         // Estado de la cita
  medicalHistoryId: string; // ID de la historia médica
}
```

## 🧱 Repositories y Acceso a Datos

### `ApponitmentUserRepository`
- Extiende `BaseRepository<AppointmentMedicalResponse>`
- Métodos específicos para citas médicas:
  - `getConfirmedAppointmentsByUserId(userId)`: Citas confirmadas del médico
  - `getCompletedAppointmentsByUserId(userId)`: Citas completadas del médico
  - `getAllConfirmedAppointmentsAdmin()`: Todas las citas confirmadas (admin)
  - `getAllCompletedAppointmentsAdmin()`: Todas las citas completadas (admin)
  - `getBranchConfirmedAppointmentsByUserId(userId)`: Citas confirmadas por sucursal
  - `getBranchCompletedAppointmentsByUserId(userId)`: Citas completadas por sucursal
  - `updateAppointmentStatus(appointmentId, status)`: Actualizar estado de cita

### `DashboardRepository`
- Métodos para métricas y KPIs:
  - `getAppointmentsBySucursal()`: Citas por sucursal (últimos 12 meses)
  - `getTopServicesBySucursal()`: Top 12 servicios más demandados
  - `getCotizacionesPorEstado()`: Cotizaciones pagadas vs pendientes
  - `getIngresosPorSucursal()`: Ingresos diarios por sucursal
  - `getKpiCardsData()`: Datos para KPI Cards

## 🚀 Casos de Uso

### `UpdateApponitmentUserUseCase`
- Actualiza el estado de una cita (solo `COMPLETED` o `NO_SHOW`)
- Valida que la cita esté en estado `CONFIRMED`
- Registra auditoría de la operación
- Retorna la cita actualizada con datos completos

## 📡 Endpoints API

### Citas Médicas (`/api/v1/appointments-user`)

#### Para Médicos
- `GET /doctor/:id/confirmed` — Citas confirmadas del médico — Respuesta: `AppointmentResponse[]`
- `GET /doctor/:id/completed` — Citas completadas del médico — Respuesta: `AppointmentResponse[]`

#### Para Administradores
- `GET /admin/confirmed` — Todas las citas confirmadas — Respuesta: `AppointmentResponse[]`
- `GET /admin/completed` — Todas las citas completadas — Respuesta: `AppointmentResponse[]`

#### Para Personal de Mesón (por sucursal)
- `GET /branch/:id/confirmed` — Citas confirmadas de la sucursal — Respuesta: `AppointmentResponse[]`
- `GET /branch/:id/completed` — Citas completadas de la sucursal — Respuesta: `AppointmentResponse[]`

#### Actualización de Estado
- `PATCH /:id/status` — Actualizar estado de cita — Body: `UpdateAppointmentUserDto` — Respuesta: `BaseApiResponse<AppointmentResponse>`

### Dashboard (`/api/v1/dashboard`)

#### Métricas y KPIs
- `GET /citas-por-sucursal` — Citas por sucursal (últimos 12 meses) — Respuesta: `{ month, JLBYR, Yanahuara }[]`
- `GET /top-servicios-por-sucursal` — Top 12 servicios más demandados — Respuesta: `{ serviceName, JLBYR, Yanahuara }[]`
- `GET /cotizaciones-por-estado` — Cotizaciones pagadas vs pendientes — Respuesta: `{ month, pendientes, pagadas }[]`
- `GET /ingresos-por-sucursal` — Ingresos diarios por sucursal — Respuesta: `{ ingresos: { date, sucursal }[], sucursales: string[] }`
- `GET /kpi-cards` — Datos para KPI Cards — Respuesta: `{ totalIngresos, ingresoPromedio, totalPacientes, citasCompletadas, citasPendientes }`

## 🔒 Seguridad y Autorización
- Decoradores: `@Auth()`, `@GetUser()`
- Filtrado por usuario médico (solo ve sus citas)
- Filtrado por sucursal para personal de mesón
- Acceso administrativo para supervisores
- Auditoría en todas las operaciones de cambio de estado

## 📏 Reglas y Validaciones de Negocio
- Solo se pueden actualizar citas en estado `CONFIRMED`
- Estados permitidos para actualización: `COMPLETED`, `NO_SHOW`
- Validación de existencia de usuario asociado a staff médico
- Validación de sucursal asignada para personal de mesón
- Cálculo de métricas basado en fechas de citas (`start`) y órdenes (`createdAt`)

## 📊 Dashboard y Métricas

### KPIs Principales
- **Total de Ingresos**: Suma de órdenes completadas del mes actual
- **Ingreso Promedio**: Promedio diario de ingresos
- **Total de Pacientes**: Conteo de pacientes activos
- **Citas Completadas**: Citas completadas del mes actual
- **Citas Pendientes**: Citas confirmadas futuras

### Gráficos y Reportes
- **Citas por Sucursal**: Evolución mensual de citas por sucursal
- **Top Servicios**: Los 12 servicios más demandados
- **Cotizaciones**: Estado de pagos (pendientes vs pagadas)
- **Ingresos Diarios**: Evolución de ingresos por sucursal

## 🧪 Testing Recomendado
- Unit: casos de uso de actualización de estado, validaciones de usuario/staff
- Integration: repositorios con Prisma y consultas complejas
- E2E: endpoints de citas y dashboard con diferentes roles de usuario

## 🚨 Manejo de Errores
- Validación de existencia de usuario asociado a staff
- Validación de estados permitidos para actualización
- Manejo de errores en consultas de métricas complejas
- Logs detallados para debugging de consultas de dashboard

## 🔧 Configuración
Variables sugeridas para métricas:
```env
DASHBOARD_MONTHS_BACK=12
DASHBOARD_TOP_SERVICES_LIMIT=12
DASHBOARD_INCOME_MONTHS_BACK=3
```

## 🔗 Integraciones
- **Login**: Autenticación y autorización de usuarios
- **Staff**: Asociación de usuarios con personal médico
- **Branch**: Filtrado por sucursales
- **Pay**: Datos de órdenes para métricas de ingresos
- **Audit**: Auditoría de cambios de estado

## 📈 Flujo de Trabajo

### Para Médicos
1. Médico accede a sus citas confirmadas (`/doctor/:id/confirmed`)
2. Ve lista de citas del día con detalles completos
3. Al finalizar la consulta, actualiza estado a `COMPLETED`
4. Sistema registra auditoría y actualiza métricas

### Para Administradores
1. Acceso a todas las citas confirmadas/completadas
2. Monitoreo de métricas y KPIs del dashboard
3. Análisis de tendencias por sucursal y servicio

### Para Personal de Mesón
1. Acceso a citas de su sucursal específica
2. Monitoreo de citas confirmadas para el día
3. Actualización de estados según necesidad

---

Documentación del módulo Appointment Medical - Sistema API Juan Pablo II
