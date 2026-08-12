import { ProductImageEntity } from '../entities/product-image.entity';

export interface AddProductImageData {
  productId: string;
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
}

export abstract class ProductImageRepository {
  abstract create(data: AddProductImageData): Promise<ProductImageEntity>;

  abstract findAll(productId: string): Promise<ProductImageEntity[]>;

  abstract findById(
    productId: string,
    imageId: string,
  ): Promise<ProductImageEntity | null>;

  abstract softDelete(productId: string, imageId: string): Promise<void>;
}
