import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CategoryModule } from './category/category.module';
import { ProductsModule } from './products/products.module';
import { ProductVariationModule } from './product-variation/product-variation.module';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { IncomingModule } from './incoming/incoming.module';
import { OutgoingModule } from './outgoing/outgoing.module';
import { StockModule } from './stock/stock.module';

@Module({
  providers: [InventoryService],
  exports: [InventoryService],
  imports: [
    CategoryModule,
    ProductsModule,
    ProductVariationModule,
    CloudflareModule,
    IncomingModule,
    OutgoingModule,
    StockModule,
  ],
})
export class InventoryModule {}
