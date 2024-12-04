
```bash

# esquema

model Calendario {
  id         String   @id @default(uuid())
  personalId String
  personal   Personal @relation(fields: [personalId], references: [id])
  sucursalId String
  nombre     String   // Nombre descriptivo del calendario (ej: "Horario Normal", "Horario Verano")
  color      String?  // Color para identificar visualmente el calendario
  isDefault  Boolean  @default(false) // Indica si es el calendario principal del empleado
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now()) @db.Timestamptz(6)
  updatedAt  DateTime @updatedAt

  eventos     Evento[]      // Eventos asociados al calendario
  recurrencia Recurrencia[] // Reglas de recurrencia
}

model Evento {
  id           String    @id @default(uuid())
  calendarioId String
  calendario   Calendario @relation(fields: [calendarioId], references: [id])
  titulo       String    // Título del evento (ej: "Ingreso", "Almuerzo", "Salida")
  descripcion  String?   // Descripción opcional del evento
  fechaInicio  String  // Fecha y hora de inicio del evento
  fechaFin     String  // Fecha y hora de fin del evento
  todoElDia    Boolean   @default(false) // Indica si el evento dura todo el día
  tipo         String    // INGRESO, SALIDA, ALMUERZO, DESCANSO, PERMISO
  color        String?   // Color específico para este evento
  
  // Campos específicos para permisos
  esPermiso     Boolean  @default(false)
  tipoPermiso   String?  // MEDICO, PERSONAL, VACACIONES, etc.
  estadoPermiso String?  // PENDIENTE, APROBADO, RECHAZADO
  
  // Campos de control
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now()) @db.Timestamptz(6)
  updatedAt  DateTime @updatedAt
}

model Recurrencia {
  id           String    @id @default(uuid())
  calendarioId String
  calendario   Calendario @relation(fields: [calendarioId], references: [id])
  
  // Reglas de recurrencia
  frecuencia   String    // DIARIA, SEMANAL, MENSUAL, ANUAL
  intervalo    Int       // Cada cuántas unidades de frecuencia se repite 1
  fechaInicio  DateTime  // Cuándo comienza la recurrencia
  fechaFin     DateTime? // Cuándo termina la recurrencia (opcional)
  
  // Campos de control
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now()) @db.Timestamptz(6)
  updatedAt  DateTime @updatedAt
}


```
