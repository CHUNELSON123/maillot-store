export type ProductOptionType = 'COLOR' | 'EDITION';

export interface CreateProductOptionData {
  type: ProductOptionType;
  name: string;
}

export interface UpdateProductOptionData {
  name: string;
}

export interface ProductOptionEntity {
  id: string;
  type: ProductOptionType;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export abstract class ProductOptionRepository {
  abstract findAll(type?: ProductOptionType): Promise<ProductOptionEntity[]>;

  abstract create(data: CreateProductOptionData): Promise<ProductOptionEntity>;

  abstract update(id: string, data: UpdateProductOptionData): Promise<ProductOptionEntity>;

  abstract softDelete(id: string): Promise<void>;
}