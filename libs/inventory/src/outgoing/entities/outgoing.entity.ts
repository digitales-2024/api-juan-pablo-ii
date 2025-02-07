import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  isActive?: boolean;
}

export class OutgoingCreateResponseData {
  @ApiProperty()
  outgoingId: string;

  @ApiProperty()
  movementTypeId: string;
}

export class OutgoingStorage {
  @ApiProperty()
  name: string;
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

  @ApiProperty()
  isActive?: boolean;

  @ApiProperty({
    type: OutgoingProduct,
  })
  Product?: OutgoingProduct;
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
