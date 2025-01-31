import { ApiProperty } from '@nestjs/swagger';

export class Stock {
  @ApiProperty()
  id: string;

  @ApiProperty()
  storageId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  price: number;
}

// {
//   idStorage: storage.id,
//   name: storage.name,
//   location: storage.location,
//   address: branch.address,
//   staff: staff.name,
//   description: typeStorage.description,
//   stock: any,
// }

export class StockByStorage {
  @ApiProperty()
  idStorage: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location?: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  staff: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  stock: any; //Stock[]
}
