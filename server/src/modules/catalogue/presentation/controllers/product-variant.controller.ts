import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateProductVariantUseCase } from '../../application/use-cases/create-product-variant.use-case';
import { DeleteProductVariantUseCase } from '../../application/use-cases/delete-product-variant.use-case';
import { GetProductVariantsUseCase } from '../../application/use-cases/get-product-variants.use-case';
import { GetProductVariantUseCase } from '../../application/use-cases/get-product-variant.use-case';
import { UpdateProductVariantUseCase } from '../../application/use-cases/update-product-variant.use-case';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';

@Controller({
  path: 'products/:productId/variants',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductVariantController {
  constructor(
    private readonly createProductVariantUseCase: CreateProductVariantUseCase,
    private readonly getProductVariantsUseCase: GetProductVariantsUseCase,
    private readonly getProductVariantUseCase: GetProductVariantUseCase,
    private readonly updateProductVariantUseCase: UpdateProductVariantUseCase,
    private readonly deleteProductVariantUseCase: DeleteProductVariantUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.createProductVariantUseCase.execute({
      productId,
      sku: dto.sku,
      size: dto.size,
      color: dto.color,
      edition: dto.edition,
      price: dto.price,
      status: dto.status,
    });
  }

  @Get()
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findAll(@Param('productId') productId: string) {
    return this.getProductVariantsUseCase.execute(productId);
  }

  @Get(':variantId')
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findOne(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.getProductVariantUseCase.execute(productId, variantId);
  }

  @Patch(':variantId')
  @Roles('Administrator', 'Staff')
  update(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.updateProductVariantUseCase.execute(productId, variantId, {
      sku: dto.sku,
      size: dto.size,
      color: dto.color,
      edition: dto.edition,
      price: dto.price,
      status: dto.status,
    });
  }

  @Delete(':variantId')
  @Roles('Administrator')
  remove(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.deleteProductVariantUseCase.execute(productId, variantId);
  }
}
