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

export class TypeProductResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class ActiveProductTypeProduct {
  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;
}
