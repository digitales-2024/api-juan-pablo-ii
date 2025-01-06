import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateStockDto {
  @ApiProperty({
    description: 'ID de almacen',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  storageId: string;

  @ApiProperty({
    description: 'ID del producto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Stock disponible en este almacén',
    example: 100.0,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({
    description: 'Stock disponible en este almacén',
    example: 100.0,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
