import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

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
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({
    description: 'Precio de compra del producto',
    required: false,
  })
  @IsOptional()
  buyingPrice?: number;

  @ApiProperty()
  date?: Date;

  @ApiProperty()
  state?: boolean;
}
