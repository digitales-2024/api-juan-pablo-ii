
```bash

# Libreria de inventario de los productos y reportes de stocks y registro de ingresos salidas y stocks.

#flujo grama : https://miro.com/app/board/uXjVLCz5TeU=/?share_link_id=745684739583


```
#tabla

// Tabla Categoria
model Categoria {
  id          String  @id @default(uuid())
  name        String // Nombre de la categoría (ej. 'Medicamentos', 'Cosméticos', 'Materiales', etc.)
  description String? // Descripción opcional que proporciona más detalles sobre la categoría

  isActive  Boolean    @default(true) // Campo para controlar si la categoría está activa o no
  createdAt DateTime   @default(now()) @db.Timestamptz(6)
  updatedAt DateTime   @updatedAt
  Producto  Producto[] // Relación con la tabla Producto. Un producto puede estar asociado a una categoría.
}

// Tabla TipoProducto
model TipoProducto {
  id          String  @id @default(uuid())
  name        String // Nombre del tipo de producto (subcategoría), como 'Antibióticos', 'Bloqueadores solares', 'Gasas', etc.
  description String? // Descripción opcional del tipo de producto (detalles adicionales o especificaciones)

  isActive  Boolean    @default(true) // Campo para controlar si el tipo de producto está activo o no
  createdAt DateTime   @default(now()) @db.Timestamptz(6)
  updatedAt DateTime   @updatedAt
  Producto  Producto[] // Relación con la tabla Producto. Un producto puede estar asociado a un tipo de producto específico.
}

// Tabla Producto
model Producto {
  id String @id @default(uuid())

  // Relación con Categoria y TipoProducto
  categoriaId    String
  categoria      Categoria    @relation(fields: [categoriaId], references: [id])
  tipoProductoId String
  tipoProducto   TipoProducto @relation(fields: [tipoProductoId], references: [id])

  // Información básica del producto
  name                      String // Nombre del producto (ej. 'Paracetamol', 'Protector solar', 'Gasas estériles', etc.)
  precio                    Float // Precio de venta del producto (sin descuentos)
  unidadMedida              String? // Unidad de medida (ml, kg, caja, etc.)
  proveedor                 String? // Fabricante o proveedor
  uso                       String? // Paciente, cliente, personal, etc.
  usoProducto               String? // Venta, uso interno, etc.
  description               String? // 
  codigoProducto            String? // Código de barras o código único del producto
  descuento                 Float? // Descuento aplicado, si aplica
  observaciones             String? // Observaciones adicionales
  condicionesAlmacenamiento String? // Condiciones de almacenamiento (ej. "refrigerar")
  isActive                  Boolean @default(true)
  imagenUrl                 String? // URL de la imagen del producto

  // Fechas de control
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  updatedAt DateTime @updatedAt

  // Relación con el inventario (Almacen)
  Storage  Storage[] // Relación con Almacen (para el inventario)
  Movement Movement[]
}

model TypeStorage {
  id          String   @id @default(uuid())
  name        String // Ejemplo: "Producto Terminado", "Materia Prima", etc.
  description String? // Descripción opcional del tipo de almacén
  branchId    String? // Clave foránea a Sucursal o local
  staffId     String? // Clave foránea a Personal empleado responsable del almacén
  isActive    Boolean  @default(true) // Campo para controlar si está activo o no
  createdAt   DateTime @default(now()) @db.Timestamptz(6)
  updatedAt   DateTime @updatedAt

  Storage Storage[] // Relación con la tabla Almacen
}

//tabla almacen
model Storage {
  id            String      @id @default(uuid())
  productoId    String
  Producto      Producto    @relation(fields: [productoId], references: [id])
  name          String // Nombre del almacén
  location      String? // Ubicación física del almacén
  typeStorageId String
  TypeStorage   TypeStorage @relation(fields: [typeStorageId], references: [id]) // Relación con TipoAlmacen

  stock Float @default(0) // Stock disponible en este almacén

  Incoming  Incoming[] // Relación con Ingreso
  Outgoing  Outgoing[] // Relación con Salida
  isActive  Boolean    @default(true) // Campo para controlar si está activo o no
  createdAt DateTime   @default(now()) @db.Timestamptz(6)
  updatedAt DateTime   @updatedAt
}

//tabla tipo movimiento
model MovementType {
  id          String     @id @default(uuid())
  orderId     String?
  Order       Order?     @relation(fields: [orderId], references: [id])
  referenceId String? // Referencia a un registro etc
  name        String? // venta, compra, devolución, etc.
  description String? // Descripción opcional del tipo de movimiento
  state       Boolean    @default(false) // Estado que controla si el flujo se concreta o no (false = no afecta al stock)
  isIncoming  Boolean? // Booleano para identificar si es un "Ingreso" o "Salida"
  tipoExterno String? // Puede ser "Venta", "Compra", "Devolución", etc.
  isActive    Boolean    @default(true) // Campo para controlar si está activo o no
  createdAt   DateTime   @default(now()) @db.Timestamptz(6)
  updatedAt   DateTime   @updatedAt
  Movement    Movement[]
}

// tabla movimientos
model Movement {
  id             String        @id @default(uuid())
  movementTypeId String?
  MovementType   MovementType? @relation(fields: [movementTypeId], references: [id])
  incomingId     String?
  Incoming       Incoming?     @relation(fields: [incomingId], references: [id])
  outgoingId     String?
  Outgoing       Outgoing?     @relation(fields: [outgoingId], references: [id])
  productoId     String
  Producto       Producto      @relation(fields: [productoId], references: [id])
  quantity       Float // Cantidad de producto que se movió
  date           DateTime      @default(now()) @db.Timestamptz(6)
  state          Boolean       @default(false) // Estado para registrar si el movimiento ha sido procesado o no
  isActive       Boolean       @default(true) // Campo para controlar si está activo o no
  createdAt      DateTime      @default(now()) @db.Timestamptz(6)
  updatedAt      DateTime      @updatedAt
}

//tabla ingresos 
model Incoming {
  id          String   @id @default(uuid())
  name        String?
  description String?
  storageId   String
  Storage     Storage  @relation(fields: [storageId], references: [id])
  date        DateTime @default(now()) @db.Timestamptz(6)
  state       Boolean  @default(false) // Estado que indica si el ingreso es concreto (true) o está en proceso (false)
  referenceId String? // Referencia a un registro etc
  isActive    Boolean  @default(true) // Campo para controlar si está activo o no
  createdAt   DateTime @default(now()) @db.Timestamptz(6)
  updatedAt   DateTime @updatedAt

  Movement Movement[] // Relación con Movimiento
}

//tabla salidas
model Outgoing {
  id          String   @id @default(uuid())
  name        String?
  description String?
  storageId   String
  Storage     Storage  @relation(fields: [storageId], references: [id])
  date        DateTime @default(now()) @db.Timestamptz(6)
  state       Boolean  @default(false) // Estado que indica si la salida es concreta (true) o está en proceso (false)
  referenceId String? // Referencia a un registro etc
  isActive    Boolean  @default(true) // Campo para controlar si está activo o no
  createdAt   DateTime @default(now()) @db.Timestamptz(6)
  updatedAt   DateTime @updatedAt

  Movement Movement[] // Relación con Movimiento
}