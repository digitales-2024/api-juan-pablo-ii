import { ApiProperty } from '@nestjs/swagger';

export class TypeMovement {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId?: string;

  @ApiProperty()
  referenceId?: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  state: boolean;

  @ApiProperty()
  isIncoming: boolean;

  @ApiProperty()
  tipoExterno?: string;
}
