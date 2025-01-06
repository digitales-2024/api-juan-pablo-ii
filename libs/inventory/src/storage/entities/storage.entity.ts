import { ApiProperty } from '@nestjs/swagger';

export class Storage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location?: string;

  @ApiProperty()
  typeStorageId: string;
}
