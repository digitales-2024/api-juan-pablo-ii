# Documentación del Sistema - API Juan Pablo II

## 📋 Descripción General

El **Sistema API Juan Pablo II** es una aplicación backend desarrollada en **NestJS** que gestiona un centro médico/clínica. El sistema maneja citas médicas, inventario, personal, pacientes, facturación y otros aspectos administrativos de una institución de salud.

## 🏗️ Arquitectura del Sistema

### **Arquitectura General**
- **Framework**: NestJS (Node.js con TypeScript)
- **Patrón**: Arquitectura modular con separación de responsabilidades
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT con Passport
- **Documentación API**: Swagger/OpenAPI
- **Contenedores**: Docker y Docker Compose

### **Estructura de Módulos**

```
📁 api-juan-pablo-ii/
├── 📁 src/
│   ├── 📁 modules/           # Módulos principales de la aplicación
│   │   ├── appointments/     # Gestión de citas médicas
│   │   ├── billing/         # Facturación y pagos
│   │   ├── branch/          # Gestión de sucursales
│   │   ├── services/        # Servicios médicos
│   │   └── staff-schedule/  # Horarios del personal
│   ├── 📁 cloudflare/       # Integración con Cloudflare
│   ├── 📁 common/           # Utilidades comunes
│   └── 📁 dto/              # Data Transfer Objects
├── 📁 libs/                 # Bibliotecas compartidas
│   ├── calendar/            # Gestión de calendarios
│   ├── clients/             # Gestión de clientes
│   ├── inventory/           # Control de inventario
│   ├── login/               # Autenticación y autorización
│   ├── medical-consultation/ # Consultas médicas
│   ├── medical-procedure/   # Procedimientos médicos
│   ├── pacient/             # Gestión de pacientes
│   ├── pay/                 # Sistema de pagos
│   ├── prescription/        # Prescripciones médicas
│   ├── prisma/              # Configuración de base de datos
│   ├── staff/               # Gestión del personal
│   └── working-hours/       # Horarios de trabajo
└── 📁 prisma/               # Esquema y migraciones de BD
```

## 🔧 Tecnologías Utilizadas

### **Backend**
- **NestJS**: Framework principal para la API REST
- **TypeScript**: Lenguaje de programación
- **Prisma**: ORM para PostgreSQL
- **JWT**: Autenticación basada en tokens
- **Passport**: Estrategias de autenticación
- **Class-validator**: Validación de datos
- **Swagger**: Documentación de API

### **Base de Datos**
- **PostgreSQL**: Base de datos principal
- **Prisma Client**: Cliente ORM
- **Migraciones**: Control de versiones de esquema

### **Infraestructura**
- **Docker**: Contenedorización
- **Docker Compose**: Orquestación de servicios
- **Cloudflare**: CDN y servicios en la nube
- **AWS S3**: Almacenamiento de archivos

## 📊 Modelos de Datos Principales

### **Gestión de Usuarios y Permisos**
- `User`: Usuarios del sistema
- `Rol`: Roles de usuario
- `Permission`: Permisos específicos
- `Module`: Módulos del sistema
- `Audit`: Auditoría de acciones

### **Gestión Médica**
- `Patient`: Pacientes
- `Staff`: Personal médico y administrativo
- `Service`: Servicios médicos
- `Appointment`: Citas médicas
- `Prescription`: Prescripciones
- `MedicalConsultation`: Consultas médicas

### **Gestión de Inventario**
- `Producto`: Productos médicos
- `Categoria`: Categorías de productos
- `Storage`: Almacenes
- `Stock`: Control de stock
- `Movement`: Movimientos de inventario

### **Gestión de Horarios**
- `StaffSchedule`: Horarios del personal
- `Event`: Eventos del calendario
- `TimeOff`: Ausencias del personal
- `WorkingHours`: Horarios de trabajo

### **Facturación y Pagos**
- `Order`: Órdenes de compra
- `PaymentMethod`: Métodos de pago
- `Branch`: Sucursales

## 🔄 Flujo de Datos

### **Autenticación y Autorización**
1. Usuario se autentica con email/password
2. Sistema valida credenciales y genera JWT
3. Token se usa para autorizar requests posteriores
4. Sistema verifica permisos por módulo/acción

### **Gestión de Citas**
1. Paciente solicita cita
2. Sistema valida disponibilidad del médico
3. Se crea evento en calendario
4. Se genera orden de pago
5. Confirmación después del pago

### **Control de Inventario**
1. Ingreso de productos al almacén
2. Actualización automática de stock
3. Movimientos registrados con auditoría
4. Alertas de stock bajo

## 🚀 Configuración y Despliegue

### **Requisitos**
- Node.js 18+
- PostgreSQL
- Docker y Docker Compose
- pnpm (gestor de paquetes)

### **Variables de Entorno**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/juanpablo
JWT_SECRET=your-secret-key
WEB_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
```

### **Comandos Principales**
```bash
# Instalación
pnpm install

# Desarrollo
pnpm run start:dev

# Producción
pnpm run build
pnpm run start:prod

# Base de datos
npx prisma migrate dev
npx prisma generate

# Docker
docker-compose up -d
```

## 📚 Endpoints Principales

### **Autenticación**
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión

### **Citas**
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Cancelar cita

### **Pacientes**
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente

### **Inventario**
- `GET /api/inventory/products` - Listar productos
- `POST /api/inventory/movements` - Registrar movimiento
- `GET /api/inventory/stock` - Consultar stock

## 🔒 Seguridad

### **Autenticación**
- JWT tokens con expiración
- Refresh tokens para renovación
- Logout con invalidación de tokens

### **Autorización**
- Sistema de roles y permisos
- Control de acceso por módulo
- Auditoría de acciones críticas

### **Validación**
- Validación de entrada con class-validator
- Sanitización de datos
- Protección contra inyección SQL (Prisma)

## 📈 Monitoreo y Logs

### **Auditoría**
- Registro de acciones de usuarios
- Historial de cambios en datos críticos
- Trazabilidad de operaciones

### **Logs**
- Logs estructurados con Winston
- Diferentes niveles de logging
- Rotación de archivos de log

## 🔄 Integraciones

### **Cloudflare**
- CDN para archivos estáticos
- Optimización de imágenes
- Protección DDoS

### **AWS S3**
- Almacenamiento de archivos
- Backup de documentos
- Gestión de imágenes de productos

### **Email**
- Notificaciones automáticas
- Confirmaciones de citas
- Recordatorios de pagos

## 📋 Estado del Proyecto

### **Funcionalidades Implementadas**
- ✅ Sistema de autenticación y autorización
- ✅ Gestión de usuarios y roles
- ✅ CRUD de pacientes
- ✅ Sistema de citas médicas
- ✅ Control de inventario
- ✅ Gestión de personal
- ✅ Facturación básica
- ✅ Calendario de eventos
- ✅ API documentada con Swagger

### **Funcionalidades Pendientes**
- 🔄 Integración completa con pasarelas de pago
- 🔄 Reportes avanzados
- 🔄 Notificaciones push
- 🔄 Integración con sistemas externos de salud

## 👥 Equipo de Desarrollo

- **Framework**: NestJS
- **Base de Datos**: PostgreSQL + Prisma
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI
- **Contenedores**: Docker + Docker Compose

## 📚 Documentación de Módulos

Cada módulo del sistema tiene su propia documentación técnica detallada en su directorio correspondiente:

### **Módulos Principales (src/modules/)**
- **📋 Módulo Appointments**: `src/modules/appointments/README.md`
  - Gestión completa de citas médicas
  - Casos de uso, endpoints, validaciones

- **💰 Módulo Billing**: `src/modules/billing/README.md`
  - Sistema central de facturación
  - Órdenes de citas, recetas, ventas y compras

- **🏢 Módulo Branch**: `src/modules/branch/README.md`
  - Gestión de sucursales
  - CRUD completo con auditoría

- **🏥 Módulo Services**: `src/modules/services/README.md`
  - Gestión de servicios médicos y tipos
  - CRUD dual con validaciones específicas

### **Módulos de Biblioteca (libs/)**
- **🔐 Módulo Login**: `libs/login/README.md`
  - Sistema de autenticación y autorización
  - JWT, RBAC, auditoría, gestión de usuarios

- **📦 Módulo Inventory**: `libs/inventory/README.md`
  - Gestión de inventario médico
  - Productos, almacenes, movimientos, stock

- **👥 Módulo Staff**: `libs/staff/README.md`
  - Gestión de personal y tipos (especialidades)
  - CRUD, operaciones en lote y auditoría

- **🏥 Módulo Appointment Medical**: `libs/appointment-medical/README.md`
  - Gestión de citas médicas para personal médico y administrativo
  - Dashboard con métricas, KPIs y actualización de estados

- **📅 Módulo Calendar**: `libs/calendar/README.md`
  - Sistema completo de calendario con eventos y ausencias
  - Eventos recurrentes, conflictos de horarios y sincronización

- **👥 Módulo Pacient**: `libs/pacient/README.md`
  - Gestión completa de pacientes, historias médicas y recetas
  - Registro de pacientes, historias clínicas y prescripciones médicas

### **Estructura de Documentación por Módulo**
Cada README.md de módulo incluye:
- 🎯 Descripción general y propósito
- 🏗️ Arquitectura y estructura de directorios
- 🔧 Dependencias y configuraciones
- 📊 Modelos de datos y entidades
- 🚀 Casos de uso específicos
- 📡 Endpoints API con ejemplos
- 🔒 Seguridad y autorización
- 🔄 Eventos y notificaciones
- 📊 Validaciones de negocio
- 🗄️ Acceso a datos y repositories
- 🧪 Testing y casos de prueba
- 🔧 Configuración y variables de entorno
- 📈 Métricas y monitoreo
- 🚨 Manejo de errores específicos

---

*Documentación generada automáticamente - Sistema API Juan Pablo II*
