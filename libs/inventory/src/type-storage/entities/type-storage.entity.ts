import { ApiProperty } from '@nestjs/swagger';

export class TypeStorage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  // @ApiProperty()
  // branchId?: string;

  // @ApiProperty()
  // staffId?: string;

  @ApiProperty()
  isActive?: boolean;
}

// export class DetailedTypeStorage extends TypeStorage {
//   @ApiProperty({
//     type: Branch,
//   })
//   branch?: Pick<Branch, 'name'>;

//   @ApiProperty({
//     type: Staff,
//   })
//   staff?: Pick<Staff, 'name'>;
// }
