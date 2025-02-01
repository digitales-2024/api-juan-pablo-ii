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

// {
//   "idProduct": "18abef76-b67e-44eb-afdc-3bb8f573f17c",
//   "name": "Paracetamol 500mg",
//   "unit": "mg",
//   "price": 15.5,
//   "stock": 30,
//   "totalPrice": 465
// }

// @ApiExtension('x-nullable', false)
export class ProductStockResponse {
  @ApiProperty()
  idProduct: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  totalPrice: number;
}

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

  @ApiProperty({ type: [ProductStockResponse] })
  stock: ProductStockResponse[];
}
