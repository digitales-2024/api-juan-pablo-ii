import { ApiProperty } from '@nestjs/swagger';

export class Storage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productoId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location?: string;

  @ApiProperty()
  typeStorageId: string;

  @ApiProperty()
  stock: number;
}
