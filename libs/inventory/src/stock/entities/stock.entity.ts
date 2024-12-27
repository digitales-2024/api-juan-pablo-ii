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
