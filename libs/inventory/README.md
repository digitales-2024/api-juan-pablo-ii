
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
  nombre                    String
  precio                    Float
  unidadMedida              String? // Unidad de medida (ml, kg, caja, etc.)
  proveedor                 String? // Fabricante o proveedor
  uso                       String? // Paciente, cliente, personal, etc.
  usoProducto               String? // Venta, uso interno, etc.
  descripcion               String? // 
  codigoProducto            String? // Código de barras o código único del producto
  descuento                 Float?  // Descuento aplicado, si aplica
  observaciones             String? // Observaciones adicionales
  condicionesAlmacenamiento String? // Condiciones de almacenamiento (ej. "refrigerar")
  isActive                  Boolean @default(true)
  imagenUrl                 String? // URL de la imagen del producto

  // Fechas de control
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  updatedAt DateTime @updatedAt

  // Relación con el inventario (Almacen)
  Almacen Almacen[] // Relación con Almacen (para el inventario)
}