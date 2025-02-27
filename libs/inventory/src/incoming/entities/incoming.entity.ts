import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

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

  @ApiProperty({
    required: false,
  })
  isTransference?: boolean;

  @ApiProperty({
    required: false,
  })
  outgoingId?: string;

  @ApiProperty()
  isActive?: boolean;
}

// {
//   incomingId,
//   movementTypeId,
// };
// export class IncomingCreateResponseData {
//   @ApiProperty()
//   incomingId: string;

//   @ApiProperty()
//   movementTypeId: string;
// }

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

export class IncomingBranch {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class IncomingStorageType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class IncomingStorage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    type: IncomingStorageType,
  })
  TypeStorage: IncomingStorageType;

  @ApiProperty({
    type: IncomingBranch,
    required: false,
  })
  @IsOptional()
  branch?: IncomingBranch;
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

  // @ApiProperty({
  //   type: [IncomingStock],
  // })
  // Stock: IncomingStock[];
}
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

  @ApiProperty({
    required: false,
  })
  buyingPrice?: number;

  @ApiProperty()
  isActive?: boolean;

  @ApiProperty({
    type: IncomingProduct,
  })
  Producto?: IncomingProduct;
}

export class DetailedIncoming extends Incoming {
  @ApiProperty({
    type: IncomingStorage,
  })
  Storage: IncomingStorage;

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
