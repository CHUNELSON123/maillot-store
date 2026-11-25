export type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  discountType: string;
  discountValue: number;
  targetType: 'ALL' | 'BRAND' | 'CATEGORY' | 'PRODUCT';
  targetIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
