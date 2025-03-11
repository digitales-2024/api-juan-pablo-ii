// product.entity.ts
import {
  ActiveProductCategory,
  Category,
} from '@inventory/inventory/category/entities/category.entity';
import { ActiveProductTypeProduct } from '@inventory/inventory/type-product/entities/type-product.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ProductUse, TipoProducto } from '@prisma/client';
import { ProductUse as Use } from './product.enum';

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

  @ApiProperty({
    enum: Use,
  })
  uso?: Use;

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

export class ActiveProduct {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  precio: number;

  @ApiProperty()
  codigoProducto?: string;

  @ApiProperty()
  unidadMedida?: string;

  @ApiProperty()
  categoriaId: string;

  @ApiProperty()
  tipoProductoId: string;

  @ApiProperty({
    enum: Use,
  })
  uso?: ProductUse;

  @ApiProperty()
  categoria: ActiveProductCategory;

  @ApiProperty()
  tipoProducto: ActiveProductTypeProduct;
}

export class ProductSearch {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
