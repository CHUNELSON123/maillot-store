import { ProductVariantEntity } from '../entities/product-variant.entity';

export interface CreateProductVariantData {
  productId: string;
  sku: string;
  size?: string;
  color?: string;
  edition?: string;
  price?: number;
  status: string;
}

export interface UpdateProductVariantData {
  sku?: string;
  size?: string;
  color?: string;
  edition?: string;
  price?: number;
  status?: string;
}

export abstract class ProductVariantRepository {
  abstract create(
    data: CreateProductVariantData,
  ): Promise<ProductVariantEntity>;

  abstract findAll(productId: string): Promise<ProductVariantEntity[]>;

  abstract findById(
    productId: string,
    variantId: string,
  ): Promise<ProductVariantEntity | null>;

  abstract update(
    productId: string,
    variantId: string,
    data: UpdateProductVariantData,
  ): Promise<ProductVariantEntity>;

  abstract softDelete(productId: string, variantId: string): Promise<void>;
}
