// product.entity.ts
import { Category } from '@inventory/inventory/category/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TipoProducto } from '@prisma/client';

export class Product {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoriaId: string;

  // @ApiProperty()
  // categoriaNombre?: string;

  @ApiProperty()
  tipoProductoId: string;

  // @ApiProperty()
  // tipoProductoNombre?: string;

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

  @ApiProperty()
  isActive?: boolean;

  @ApiProperty()
  createdAt?: Date;
}

export class ProductWithRelations extends Product {
  @ApiProperty()
  categoria: Partial<Category>;

  @ApiProperty()
  tipoProducto: Partial<TipoProducto>;
}
