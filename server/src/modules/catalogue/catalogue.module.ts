import { Module } from '@nestjs/common';
import { PrismaProductOptionRepository } from './infrastructure/repositories/prisma-product-option.repository';
import { ProductOptionRepository } from './domain/repositories/product-option.repository';
import { CreateProductOptionUseCase } from './application/use-cases/create-product-option.use-case';
import { DeleteProductOptionUseCase } from './application/use-cases/delete-product-option.use-case';
import { GetProductOptionsUseCase } from './application/use-cases/get-product-options.use-case';
import { UpdateProductOptionUseCase } from './application/use-cases/update-product-option.use-case';
import { ProductOptionController } from './presentation/controllers/product-option.controller';
import { PrismaCategoryRepository } from './infrastructure/repositories/prisma-category.repository';
import { CategoryRepository } from './domain/repositories/category.repository';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { GetCategoriesUseCase } from './application/use-cases/get-categories.use-case';
import { GetCategoryUseCase } from './application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { CategoryController } from './presentation/controllers/category.controller';

import { PrismaBrandRepository } from './infrastructure/repositories/prisma-brand.repository';
import { BrandRepository } from './domain/repositories/brand.repository';
import { CreateBrandUseCase } from './application/use-cases/create-brand.use-case';
import { DeleteBrandUseCase } from './application/use-cases/delete-brand.use-case';
import { GetBrandsUseCase } from './application/use-cases/get-brands.use-case';
import { GetBrandUseCase } from './application/use-cases/get-brand.use-case';
import { UpdateBrandUseCase } from './application/use-cases/update-brand.use-case';
import { BrandController } from './presentation/controllers/brand.controller';

import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository';
import { ProductRepository } from './domain/repositories/product.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { ProductController } from './presentation/controllers/product.controller';

import { PrismaProductVariantRepository } from './infrastructure/repositories/prisma-product-variant.repository';
import { ProductVariantRepository } from './domain/repositories/product-variant.repository';
import { CreateProductVariantUseCase } from './application/use-cases/create-product-variant.use-case';
import { DeleteProductVariantUseCase } from './application/use-cases/delete-product-variant.use-case';
import { GetProductVariantsUseCase } from './application/use-cases/get-product-variants.use-case';
import { GetProductVariantUseCase } from './application/use-cases/get-product-variant.use-case';
import { UpdateProductVariantUseCase } from './application/use-cases/update-product-variant.use-case';
import { ProductVariantController } from './presentation/controllers/product-variant.controller';

import { PrismaProductImageRepository } from './infrastructure/repositories/prisma-product-image.repository';
import { ProductImageRepository } from './domain/repositories/product-image.repository';
import { AddProductImageUseCase } from './application/use-cases/add-product-image.use-case';
import { GetProductImagesUseCase } from './application/use-cases/get-product-images.use-case';
import { DeleteProductImageUseCase } from './application/use-cases/delete-product-image.use-case';
import { ProductImageController } from './presentation/controllers/product-image.controller';

@Module({
  controllers: [
    CategoryController,
    BrandController,
    ProductController,
    ProductVariantController,
    ProductImageController,
    ProductOptionController,
  ],
  providers: [
    PrismaCategoryRepository,
    CreateCategoryUseCase,
    DeleteCategoryUseCase,
    GetCategoriesUseCase,
    GetCategoryUseCase,
    UpdateCategoryUseCase,

    PrismaBrandRepository,
    CreateBrandUseCase,
    DeleteBrandUseCase,
    GetBrandsUseCase,
    GetBrandUseCase,
    UpdateBrandUseCase,

    PrismaProductRepository,
    CreateProductUseCase,
    DeleteProductUseCase,
    GetProductsUseCase,
    GetProductUseCase,
    UpdateProductUseCase,

    PrismaProductVariantRepository,
    CreateProductVariantUseCase,
    DeleteProductVariantUseCase,
    GetProductVariantsUseCase,
    GetProductVariantUseCase,
    UpdateProductVariantUseCase,

    PrismaProductOptionRepository,
    CreateProductOptionUseCase,
    DeleteProductOptionUseCase,
    GetProductOptionsUseCase,
    UpdateProductOptionUseCase,
    PrismaProductImageRepository,
    AddProductImageUseCase,
    GetProductImagesUseCase,
    DeleteProductImageUseCase,

    {
      provide: CategoryRepository,
      useExisting: PrismaCategoryRepository,
    },
    {
      provide: BrandRepository,
      useExisting: PrismaBrandRepository,
    },
    {
      provide: ProductRepository,
      useExisting: PrismaProductRepository,
    },
    {
      provide: ProductVariantRepository,
      useExisting: PrismaProductVariantRepository,
    },
    {
      provide: ProductOptionRepository,
      useExisting: PrismaProductOptionRepository,
    },
    {
      provide: ProductImageRepository,
      useExisting: PrismaProductImageRepository,
    },
  ],
  exports: [
    CategoryRepository,
    BrandRepository,
    ProductRepository,
    ProductVariantRepository,
    ProductImageRepository,
    ProductOptionRepository,
  ],
})
export class CatalogueModule {}
