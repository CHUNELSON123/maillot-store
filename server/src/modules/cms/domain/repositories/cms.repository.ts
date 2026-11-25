import { BannerEntity } from '../entities/banner.entity';
import { PromotionEntity } from '../entities/promotion.entity';

export interface CreateBannerData {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface UpdateBannerData {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface CreatePromotionData {
  title: string;
  description?: string;
  imageUrl?: string;
  discountType: string;
  discountValue: number;
  targetType: string;
  targetIds: string[];
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}

export interface UpdatePromotionData {
  title?: string;
  description?: string;
  imageUrl?: string;
  discountType?: string;
  discountValue?: number;
  targetType?: string;
  targetIds?: string[];
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export abstract class CmsRepository {
  abstract getPublicContent(): Promise<Record<string, string>>;
  abstract createBanner(data: CreateBannerData): Promise<BannerEntity>;

  abstract findBanners(activeOnly?: boolean): Promise<BannerEntity[]>;

  abstract updateBanner(
    bannerId: string,
    data: UpdateBannerData,
  ): Promise<BannerEntity>;

  abstract deleteBanner(bannerId: string): Promise<void>;

  abstract createPromotion(data: CreatePromotionData): Promise<PromotionEntity>;

  abstract findPromotions(activeOnly?: boolean): Promise<PromotionEntity[]>;

  abstract updatePromotion(
    promotionId: string,
    data: UpdatePromotionData,
  ): Promise<PromotionEntity>;

  abstract deletePromotion(promotionId: string): Promise<void>;
}
