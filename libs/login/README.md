# 🔐 Módulo Login - Documentación Técnica

## 🎯 Descripción General

El módulo **Login** es el sistema central de autenticación y autorización del API Juan Pablo II. Maneja la autenticación de usuarios, gestión de roles y permisos, auditoría de acciones, y administración del sistema.

## 🏗️ Arquitectura del Módulo

### **Estructura de Directorios**
```
📁 login/
├── 📁 src/
│   ├── 📁 admin/              # Administración del sistema
│   │   ├── 📁 auth/           # Autenticación y autorización
│   │   │   ├── 📁 decorators/ # Decoradores personalizados
│   │   │   ├── 📁 guards/     # Guards de seguridad
│   │   │   ├── 📁 strategies/ # Estrategias de Passport
│   │   │   ├── 📁 dto/        # DTOs de autenticación
│   │   │   └── 📁 interfaces/ # Interfaces de usuario
│   │   ├── 📁 users/          # Gestión de usuarios
│   │   ├── 📁 rol/            # Gestión de roles
│   │   ├── 📁 modules/        # Gestión de módulos
│   │   ├── 📁 permissions/    # Gestión de permisos
│   │   └── 📁 audit/          # Auditoría de acciones
│   ├── 📁 email/              # Servicios de email
│   ├── 📁 event-emitter/      # Emisión de eventos
│   ├── 📁 interfaces/         # Interfaces compartidas
│   ├── 📁 seeds/              # Datos iniciales
│   ├── 📁 utils/              # Utilidades
│   ├── login.module.ts        # Configuración del módulo
│   └── README.md              # Esta documentación
```

### **Patrón Arquitectónico**
- **JWT Strategy** para autenticación basada en tokens
- **Role-Based Access Control (RBAC)** para autorización
- **Audit Trail** para seguimiento de acciones
- **Event-Driven** para notificaciones

## 🔧 Dependencias del Módulo

### **Módulos Internos**
```typescript
imports: [
  AdminModule,           // Administración del sistema
  PrismaModule,         // Acceso a base de datos
  SeedsModule,          // Datos iniciales
  TypedEventEmitterModule, // Eventos tipados
  EventEmitterModule,   // Eventos del sistema
  EmailModule,          // Servicios de email
]
```

### **Dependencias Externas**
- `@nestjs/jwt` - Manejo de JWT
- `@nestjs/passport` - Estrategias de autenticación
- `passport-jwt` - Estrategia JWT para Passport
- `bcrypt` - Encriptación de contraseñas
- `@nestjs/event-emitter` - Sistema de eventos

## 📊 Modelos de Datos

### **Entidades Principales**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  isSuperAdmin: boolean;
  lastLogin: DateTime;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Rol {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Permission {
  id: string;
  cod: string;
  name: string;
  description?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Module {
  id: string;
  cod: string;
  name: string;
  description?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Audit {
  id: string;
  userId: string;
  action: string;
  module: string;
  details: Json;
  ipAddress: string;
  userAgent: string;
  createdAt: DateTime;
}
```

### **Relaciones**
```typescript
// Usuario puede tener múltiples roles
UserRol {
  userId: string;
  rolId: string;
  isActive: boolean;
}

// Roles pueden tener múltiples permisos por módulo
RolModulePermissions {
  rolId: string;
  moduleId: string;
  permissionId: string;
  isActive: boolean;
}
```

## 🚀 Funcionalidades Principales

### **1. Autenticación (Auth)**
**Propósito**: Autenticación de usuarios mediante JWT

**Flujo de Autenticación**:
1. Usuario envía credenciales (email/password)
2. Sistema valida credenciales contra base de datos
3. Si son válidas, genera JWT token
4. Retorna token y datos del usuario
5. Token se usa para requests posteriores

**Estrategias de Passport**:
```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return this.authService.validateUser(payload.sub);
  }
}
```

### **2. Autorización (RBAC)**
**Propósito**: Control de acceso basado en roles y permisos

**Sistema de Permisos**:
- **Roles**: Conjunto de permisos agrupados
- **Permisos**: Acciones específicas (CREATE, READ, UPDATE, DELETE)
- **Módulos**: Áreas del sistema (appointments, patients, etc.)

**Decoradores de Autorización**:
```typescript
@Auth()                    // Requiere autenticación
@Roles('ADMIN', 'DOCTOR')  // Requiere roles específicos
@Permissions('CREATE')     // Requiere permisos específicos
@GetUser() user: UserData  // Obtiene usuario autenticado
```

### **3. Gestión de Usuarios**
**Funcionalidades**:
- CRUD de usuarios
- Asignación de roles
- Cambio de contraseñas
- Activación/desactivación de usuarios
- Historial de login

### **4. Auditoría**
**Propósito**: Registro de todas las acciones importantes

**Eventos Auditados**:
- Login/Logout
- Creación/Modificación/Eliminación de datos
- Cambios de configuración
- Accesos a recursos sensibles

## 📡 Endpoints API

### **Autenticación**
```typescript
// POST /api/v1/auth/login
Body: {
  email: string;
  password: string;
}
Response: {
  token: string;
  user: UserData;
  permissions: string[];
}

// POST /api/v1/auth/logout
Headers: Authorization: Bearer <token>
Response: { message: string }

// POST /api/v1/auth/refresh
Headers: Authorization: Bearer <token>
Response: { token: string }
```

### **Gestión de Usuarios**
```typescript
// GET /api/v1/admin/users
// POST /api/v1/admin/users
// PUT /api/v1/admin/users/:id
// DELETE /api/v1/admin/users/:id
// POST /api/v1/admin/users/:id/change-password
```

### **Gestión de Roles**
```typescript
// GET /api/v1/admin/roles
// POST /api/v1/admin/roles
// PUT /api/v1/admin/roles/:id
// DELETE /api/v1/admin/roles/:id
// POST /api/v1/admin/roles/:id/permissions
```

### **Auditoría**
```typescript
// GET /api/v1/admin/audit
Query: {
  userId?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

## 🔒 Seguridad

### **Encriptación de Contraseñas**
```typescript
// Encriptación con bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// Verificación
const isPasswordValid = await bcrypt.compare(password, hashedPassword);
```

### **JWT Configuration**
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { 
    expiresIn: '24h',
    issuer: 'juan-pablo-api',
    audience: 'juan-pablo-users'
  },
})
```

### **Guards de Seguridad**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Lógica adicional de validación
    return super.canActivate(context);
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

## 🔄 Eventos y Notificaciones

### **Eventos del Sistema**
```typescript
// Eventos de autenticación
UserLoginEvent {
  userId: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  timestamp: DateTime;
}

UserLogoutEvent {
  userId: string;
  timestamp: DateTime;
}

// Eventos de auditoría
AuditEvent {
  userId: string;
  action: string;
  module: string;
  details: any;
  ipAddress: string;
}
```

### **Notificaciones por Email**
- Confirmación de registro
- Recuperación de contraseña
- Alertas de seguridad
- Notificaciones de cambios de rol

## 📊 Validaciones de Negocio

### **Reglas de Autenticación**
1. **Contraseñas**: Mínimo 8 caracteres, mayúsculas, minúsculas, números
2. **Sesiones**: Máximo 24 horas de sesión activa
3. **Intentos**: Máximo 5 intentos fallidos antes de bloqueo temporal
4. **Cambio de Contraseña**: Obligatorio en primer login

### **Reglas de Autorización**
1. **Roles**: Usuario debe tener al menos un rol activo
2. **Permisos**: Permisos se validan por módulo y acción
3. **Jerarquía**: SuperAdmin tiene acceso completo
4. **Sucursal**: Acceso limitado por sucursal del usuario

## 🗄️ Acceso a Datos

### **Queries Principales**
```typescript
// Validación de usuario
async validateUser(userId: string): Promise<User | null> {
  return this.prisma.user.findUnique({
    where: { id: userId, isActive: true },
    include: {
      userRols: {
        where: { isActive: true },
        include: {
          rol: {
            include: {
              rolModulePermissions: {
                where: { isActive: true },
                include: {
                  module: true,
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

// Obtener permisos del usuario
async getUserPermissions(userId: string): Promise<string[]> {
  const user = await this.validateUser(userId);
  const permissions = [];
  
  user.userRols.forEach(userRol => {
    userRol.rol.rolModulePermissions.forEach(rmp => {
      permissions.push(`${rmp.module.cod}:${rmp.permission.cod}`);
    });
  });
  
  return [...new Set(permissions)];
}
```

## 🧪 Testing

### **Tipos de Tests**
1. **Unit Tests**: Servicios de autenticación
2. **Integration Tests**: Flujo completo de login
3. **E2E Tests**: Endpoints de autenticación
4. **Security Tests**: Validación de permisos

### **Casos de Prueba Críticos**
- Login con credenciales válidas
- Login con credenciales inválidas
- Validación de JWT expirado
- Verificación de permisos por rol
- Auditoría de acciones

## 🔧 Configuración

### **Variables de Entorno**
```env
# JWT Configuration
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
JWT_ISSUER=juan-pablo-api
JWT_AUDIENCE=juan-pablo-users

# Password Policy
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true

# Session Management
SESSION_TIMEOUT_HOURS=24
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=30

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Configuración del Módulo**
```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    PassportModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [AuthService, JwtStrategy],
})
```

## 📈 Métricas y Monitoreo

### **Métricas de Seguridad**
- Intentos de login fallidos
- Tokens JWT expirados
- Accesos denegados por permisos
- Actividad de usuarios por rol

### **Logs de Seguridad**
- Todos los intentos de login
- Cambios de contraseña
- Asignación/remoción de roles
- Accesos a recursos sensibles

## 🚨 Manejo de Errores

### **Errores Específicos**
```typescript
class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciales inválidas');
  }
}

class InsufficientPermissionsError extends Error {
  constructor(requiredPermission: string) {
    super(`Permiso requerido: ${requiredPermission}`);
  }
}

class UserInactiveError extends Error {
  constructor() {
    super('Usuario inactivo');
  }
}
```

### **Códigos de Error**
- `401`: No autenticado
- `403`: Sin permisos suficientes
- `429`: Demasiados intentos de login
- `422`: Datos de entrada inválidos

## 🔄 Seeds y Datos Iniciales

### **Datos por Defecto**
```typescript
// Usuario SuperAdmin
{
  email: 'admin@juanpablo.com',
  password: 'Admin123!',
  name: 'Administrador',
  isSuperAdmin: true,
  isActive: true,
}

// Roles básicos
- SUPER_ADMIN: Acceso completo
- DOCTOR: Gestión de citas y pacientes
- NURSE: Gestión de citas
- RECEPTIONIST: Gestión básica
- PATIENT: Acceso limitado
```

---

*Documentación del módulo Login - Sistema API Juan Pablo II*
