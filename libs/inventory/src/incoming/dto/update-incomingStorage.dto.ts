import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OutgoingIncomingUpdateMovementDto } from '@inventory/inventory/movement/dto';

export class UpdateIncomingStorageDtoBase {
  @ApiProperty({
    description: 'Nombre del ingreso a almacen ',
    example: 'Ingreso de regulacion , aumento de stock, etc.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({
    description: 'Descripción del ingreso',
    example: 'Descripción opcional del ingreso a alamacen',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'ID del almacén al que va ser ingresado',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @IsOptional()
  storageId: string;

  @ApiProperty({
    description: 'Fecha del ingreso',
    example: '2023-10-01T00:00:00.000Z',
    required: true,
  })
  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    return date.toISOString();
  })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'Estado del ingreso',
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
    description: 'Indica si es un traslado entre almacenes',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isTransference?: boolean;

  @ApiProperty({
    description: 'productos a ingresar al almacen y cantidad',
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
    type: [OutgoingIncomingUpdateMovementDto],
  })
  // @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => OutgoingIncomingUpdateMovementDto)
  @IsNotEmpty()
  movement: OutgoingIncomingUpdateMovementDto[];
}

export class UpdateIncomingStorageDto extends PartialType(
  UpdateIncomingStorageDtoBase,
) {}
