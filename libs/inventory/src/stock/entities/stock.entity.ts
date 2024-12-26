import { ApiProperty } from '@nestjs/swagger';

export class Stock {
  @ApiProperty()
  id: string;

  @ApiProperty()
  storageId: string;

  @ApiProperty()
  productoId: string;

  @ApiProperty()
  stock: number;
}
