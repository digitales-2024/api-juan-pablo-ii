import { ApiProperty } from '@nestjs/swagger';

export class Outgoing {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  storageId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  state: boolean;

  @ApiProperty()
  referenceId?: string;
}
