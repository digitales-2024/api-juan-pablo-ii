// type-product.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class TypeProduct {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;
}
