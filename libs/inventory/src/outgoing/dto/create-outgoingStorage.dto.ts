import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOutgoingDtoStorage {
  @ApiProperty({
    description: 'Nombre de la salida de almacen ',
    example: 'salida de transferencia , correcion de stock, etc.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'Descripción de salida',
    example: 'Descripción opcional del salida de alamacen',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'ID del almacén del que va ser retirado',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  storageId: string;

  @ApiProperty({
    description: 'Fecha de salida',
    example: '2023-10-01T00:00:00.000Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'Estado del salida',
    example: true,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  state: boolean;

  @ApiProperty({
    description: 'ID de referencia puede ser un traslado, compra, etc.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty({
    description: 'productos a retirar del almacen y cantidad',
    example: [
      {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 5,
      },
      {
        productId: '123e4567-e89b-12d3-a456-426614174001',
        quantity: 10,
      },
    ],
    required: true,
  })
  @IsObject({ each: true })
  @IsNotEmpty()
  movement: Array<{
    productId: string;
    quantity: number;
  }>;
}
