import { ApiProperty } from '@nestjs/swagger';

export class Movement {
  @ApiProperty()
  id: string;

  @ApiProperty()
  movementTypeId?: string;

  @ApiProperty()
  incomingId?: string;

  @ApiProperty()
  outgoingId?: string;

  @ApiProperty()
  productoId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  state: boolean;
}
