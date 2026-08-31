export type Product = {
  id: string;
  categoryId: string;
  brandId: string;
  name: string;
  description: string | null;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  size: string | null;
  color: string | null;
  edition: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetails = Product & {
  variants: ProductVariant[];
  images: ProductImage[];
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};