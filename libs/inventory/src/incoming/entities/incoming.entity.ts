import { ApiProperty } from '@nestjs/swagger';

export class Incoming {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  storageId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  state: boolean;

  @ApiProperty()
  referenceId?: string;

  @ApiProperty()
  isActive?: boolean;
}

// {
//   incomingId,
//   movementTypeId,
// };
export class IncomingCreateResponseData {
  @ApiProperty()
  incomingId: string;

  @ApiProperty()
  movementTypeId: string;
}

// //Evaluar donde seleccionar los registros activos
// async getAllDetailedIncoming() {
//   return this.prisma.incoming.findMany({
//     include: {
//       Movement: {
//         include: {
//           Producto: {
//             include: {
//               Stock: {
//                 include: {
//                   Storage: {
//                     select: {
//                       name: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });
// }

export class IncomingStorage {
  @ApiProperty()
  name: string;
}

// model Producto {
//   id String @id @default(uuid())

//   // Relación con Categoria y TipoProducto
//   categoriaId    String
//   categoria      Categoria    @relation(fields: [categoriaId], references: [id])
//   tipoProductoId String
//   tipoProducto   TipoProducto @relation(fields: [tipoProductoId], references: [id])

//   // Información básica del producto
//   name                      String  @unique // Nombre del producto (ej. 'Paracetamol', 'Protector solar', 'Gasas estériles', etc.)
//   precio                    Float // Precio de venta del producto (sin descuentos)
//   unidadMedida              String? // Unidad de medida (ml, kg, caja, etc.)
//   proveedor                 String? // Fabricante o proveedor
//   uso                       String? // Paciente, cliente, personal, etc.
//   usoProducto               String? // Venta, uso interno, etc.
//   description               String? //
//   codigoProducto            String? // Código de barras o código único del producto
//   descuento                 Float? // Descuento aplicado, si aplica
//   observaciones             String? // Observaciones adicionales
//   condicionesAlmacenamiento String? // Condiciones de almacenamiento (ej. "refrigerar")
//   isActive                  Boolean @default(true)
//   imagenUrl                 String? // URL de la imagen del producto

//   // Fechas de control
//   createdAt DateTime @default(now()) @db.Timestamptz(6)
//   updatedAt DateTime @updatedAt

//   // Relación con el inventario (Almacen)
//   Movement Movement[]
//   Stock    Stock[]
// }
export class IncomingStock {
  @ApiProperty()
  id: string;

  @ApiProperty()
  storageId: string;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  isActive?: boolean;

  @ApiProperty({
    type: IncomingStorage,
  })
  Storage: IncomingStorage;
}

export class IncomingProduct {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoriaId: string;

  @ApiProperty()
  tipoProductoId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  precio: number;

  @ApiProperty()
  unidadMedida?: string;

  @ApiProperty()
  proveedor?: string;

  @ApiProperty()
  usoProducto?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  codigoProducto?: string;

  @ApiProperty()
  isActive?: boolean;

  @ApiProperty({
    type: [IncomingStock],
  })
  Stock: IncomingStock[];
}

// model Movement {
//   id             String        @id @default(uuid())
//   movementTypeId String?
//   MovementType   MovementType? @relation(fields: [movementTypeId], references: [id])
//   incomingId     String?
//   Incoming       Incoming?     @relation(fields: [incomingId], references: [id])
//   outgoingId     String?
//   Outgoing       Outgoing?     @relation(fields: [outgoingId], references: [id])
//   productId      String
//   Producto       Producto      @relation(fields: [productId], references: [id])
//   quantity       Float // Cantidad de producto que se movió
//   date           DateTime      @default(now()) @db.Timestamptz(6)
//   state          Boolean       @default(false) // Estado para registrar si el movimiento ha sido procesado o no
//   referenceId    String? // Referencia a un registro etc
//   isActive       Boolean       @default(true) // Campo para controlar si está activo o no
//   createdAt      DateTime      @default(now()) @db.Timestamptz(6)
//   updatedAt      DateTime      @updatedAt
// }
export class IncomingMovement {
  @ApiProperty()
  id: string;

  @ApiProperty()
  movementTypeId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  state: boolean;

  @ApiProperty()
  isActive?: boolean;

  @ApiProperty({
    type: IncomingProduct,
  })
  Product?: IncomingProduct;
}

export class DetailedIncoming extends Incoming {
  @ApiProperty({
    type: [IncomingMovement],
  })
  Movement: IncomingMovement[];
}

export class IncomingWithStorage extends Incoming {
  @ApiProperty({
    type: IncomingStorage,
  })
  Storage: IncomingStorage;
}
