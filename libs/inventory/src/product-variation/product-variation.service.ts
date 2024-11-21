import { Injectable } from '@nestjs/common';
import { CreateProductVariationDto } from './dto/create-product-variation.dto';
import { UpdateProductVariationDto } from './dto/update-product-variation.dto';

@Injectable()
export class ProductVariationService {
  create(createProductVariationDto: CreateProductVariationDto) {
    return 'This action adds a new productVariation';
  }

  findAll() {
    return `This action returns all productVariation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productVariation`;
  }

  update(id: number, updateProductVariationDto: UpdateProductVariationDto) {
    return `This action updates a #${id} productVariation`;
  }

  remove(id: number) {
    return `This action removes a #${id} productVariation`;
  }
}
