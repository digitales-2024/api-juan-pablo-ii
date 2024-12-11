// product.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoriaId: string;

  @ApiProperty()
  tipoProductoId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  precio: number;

  @ApiProperty()
  unidadMedida?: string;

  @ApiProperty()
  proveedor?: string;

  @ApiProperty()
  uso?: string;

  @ApiProperty()
  usoProducto?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  codigoProducto?: string;

  @ApiProperty()
  descuento?: number;

  @ApiProperty()
  observaciones?: string;

  @ApiProperty()
  condicionesAlmacenamiento?: string;

  @ApiProperty()
  imagenUrl?: string;
}
