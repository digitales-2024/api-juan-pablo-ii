import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class Outgoing {
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

  @ApiProperty()
  isActive?: boolean;
}

export class OutgoingCreateResponseData {
  @ApiProperty()
  outgoingId: string;

  @ApiProperty()
  movementTypeId: string;
}

export class OutgoingBranch {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class OutgoingStorageType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    type: OutgoingBranch,
    required: false,
  })
  @IsOptional()
  branch?: OutgoingBranch;
}

export class OutgoingStorage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    type: OutgoingStorageType,
  })
  TypeStorage: OutgoingStorageType;
}

// export class OutgoingStock {
//   @ApiProperty()
//   id: string;

//   @ApiProperty()
//   storageId: string;

//   @ApiProperty()
//   stock: number;

//   @ApiProperty()
//   price: number;

//   @ApiProperty()
//   isActive?: boolean;

//   @ApiProperty({
//     type: OutgoingStorage,
//   })
//   Storage: OutgoingStorage;
// }

export class OutgoingProduct {
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
  //   type: [OutgoingStock],
  // })
  // Stock: OutgoingStock[];
}

export class OutgoingMovement {
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
    type: OutgoingProduct,
  })
  Producto?: OutgoingProduct;
}

export class DetailedOutgoing extends Outgoing {
  @ApiProperty({
    type: OutgoingStorage,
  })
  Storage: OutgoingStorage;

  @ApiProperty({
    type: [OutgoingMovement],
  })
  Movement: OutgoingMovement[];
}

export class OutgoingWithStorage extends Outgoing {
  @ApiProperty({
    type: OutgoingStorage,
  })
  Storage: OutgoingStorage;
}
