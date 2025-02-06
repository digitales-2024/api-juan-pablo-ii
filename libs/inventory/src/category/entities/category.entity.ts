// category.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class Category {
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

export class ActiveProductCategory {
  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;
}

// export class CategoryResponse {
//   @ApiProperty()
//   id: string;

//   @ApiProperty()
//   name: string;

//   @ApiProperty()
//   description?: string;

//   @ApiProperty()
//   isActive: boolean;

//   @ApiProperty()
//   createdAt: Date;
// }
