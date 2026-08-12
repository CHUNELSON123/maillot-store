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
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Controller({
  path: 'products',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute({
      categoryId: dto.categoryId,
      brandId: dto.brandId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      status: dto.status,
    });
  }

  @Get()
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findAll() {
    return this.getProductsUseCase.execute();
  }

  @Get(':id')
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findOne(@Param('id') id: string) {
    return this.getProductUseCase.execute(id);
  }

  @Patch(':id')
  @Roles('Administrator', 'Staff')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, {
      categoryId: dto.categoryId,
      brandId: dto.brandId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      status: dto.status,
    });
  }

  @Delete(':id')
  @Roles('Administrator')
  remove(@Param('id') id: string) {
    return this.deleteProductUseCase.execute(id);
  }
}
