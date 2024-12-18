import { ApiProperty } from '@nestjs/swagger';

export class TypeStorage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  branchId?: string;

  @ApiProperty()
  staffId?: string;
}
