import { ProductEntity } from '../entities/product.entity';

export interface CreateProductData {
  categoryId: string;
  brandId: string;
  name: string;
  description?: string;
  price: number;
  status: string;
}

export interface UpdateProductData {
  categoryId?: string;
  brandId?: string;
  name?: string;
  description?: string;
  price?: number;
  status?: string;
}

export abstract class ProductRepository {
  abstract create(data: CreateProductData): Promise<ProductEntity>;

  abstract findAll(): Promise<ProductEntity[]>;

  abstract findById(id: string): Promise<ProductEntity | null>;

  abstract update(id: string, data: UpdateProductData): Promise<ProductEntity>;

  abstract softDelete(id: string): Promise<void>;
}
