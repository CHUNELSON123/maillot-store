import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { ListProductsDto } from '../dto/list-products.dto';

@Controller({
  path: 'products',
  version: '1',
})
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  findAll(@Query() query: ListProductsDto) {
    const hasListQuery = Object.values(query).some(
      (value) => value !== undefined,
    );

    if (!hasListQuery) {
      return this.getProductsUseCase.execute();
    }

    return this.getProductsUseCase.executePage({
      page: query.page ?? 1,
      limit: query.limit ?? 12,
      categoryId: query.categoryId,
      status: 'ACTIVE',
      search: query.search?.trim() || undefined,
      sort: query.sort,
    });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  findAllForAdmin(@Query() query: ListProductsDto) {
    return this.getProductsUseCase.executePage({
      page: query.page ?? 1,
      limit: query.limit ?? 5,
      categoryId: query.categoryId,
      brandId: query.brandId,
      status: query.status,
      search: query.search?.trim() || undefined,
      sort: query.sort,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getProductUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  remove(@Param('id') id: string) {
    return this.deleteProductUseCase.execute(id);
  }
}
