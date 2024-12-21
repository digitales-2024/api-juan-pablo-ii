import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../order.types';

export class ChangeOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'Nuevo estado de la orden',
    example: OrderStatus.PENDING,
    enumName: 'OrderStatus',
  })
  @IsEnum(OrderStatus, {
    message: `El estado debe ser uno de: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Notas sobre el cambio de estado',
    required: false,
    example: 'Cambio de estado por procesamiento',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
