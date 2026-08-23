import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';

import {
  CmsRepository,
  CreateBannerData,
  CreatePromotionData,
  UpdateBannerData,
  UpdatePromotionData,
} from '../../domain/repositories/cms.repository';

import { BannerEntity } from '../../domain/entities/banner.entity';
import { PromotionEntity } from '../../domain/entities/promotion.entity';

@Injectable()
export class PrismaCmsRepository implements CmsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBanner(data: CreateBannerData): Promise<BannerEntity> {
    const banner = await this.prisma.banner.create({
      data: {
        title: data.title,
        image_url: data.imageUrl,
        link_url: data.linkUrl,
        is_active: data.isActive ?? true,
      },
    });

    return this.toBannerEntity(banner);
  }

  async findBanners(activeOnly = false): Promise<BannerEntity[]> {
    const banners = await this.prisma.banner.findMany({
      where: {
        deleted_at: null,
        ...(activeOnly ? { is_active: true } : {}),
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return banners.map((banner) => this.toBannerEntity(banner));
  }

  async updateBanner(
    bannerId: string,
    data: UpdateBannerData,
  ): Promise<BannerEntity> {
    const existingBanner = await this.prisma.banner.findFirst({
      where: {
        id: bannerId,
        deleted_at: null,
      },
    });

    if (!existingBanner) {
      throw new NotFoundException('Banner not found');
    }

    const banner = await this.prisma.banner.update({
      where: {
        id: bannerId,
      },
      data: {
        title: data.title,
        image_url: data.imageUrl,
        link_url: data.linkUrl,
        is_active: data.isActive,
      },
    });

    return this.toBannerEntity(banner);
  }

  async deleteBanner(bannerId: string): Promise<void> {
    const existingBanner = await this.prisma.banner.findFirst({
      where: {
        id: bannerId,
        deleted_at: null,
      },
    });

    if (!existingBanner) {
      throw new NotFoundException('Banner not found');
    }

    await this.prisma.banner.update({
      where: {
        id: bannerId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async createPromotion(data: CreatePromotionData): Promise<PromotionEntity> {
    const promotion = await this.prisma.promotion.create({
      data: {
        title: data.title,
        description: data.description,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: data.isActive ?? true,
      },
    });

    return this.toPromotionEntity(promotion);
  }

  async findPromotions(activeOnly = false): Promise<PromotionEntity[]> {
    const promotions = await this.prisma.promotion.findMany({
      where: {
        deleted_at: null,
        ...(activeOnly ? { is_active: true } : {}),
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return promotions.map((promotion) => this.toPromotionEntity(promotion));
  }

  async updatePromotion(
    promotionId: string,
    data: UpdatePromotionData,
  ): Promise<PromotionEntity> {
    const existingPromotion = await this.prisma.promotion.findFirst({
      where: {
        id: promotionId,
        deleted_at: null,
      },
    });

    if (!existingPromotion) {
      throw new NotFoundException('Promotion not found');
    }

    const promotion = await this.prisma.promotion.update({
      where: {
        id: promotionId,
      },
      data: {
        title: data.title,
        description: data.description,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: data.isActive,
      },
    });

    return this.toPromotionEntity(promotion);
  }

  async deletePromotion(promotionId: string): Promise<void> {
    const existingPromotion = await this.prisma.promotion.findFirst({
      where: {
        id: promotionId,
        deleted_at: null,
      },
    });

    if (!existingPromotion) {
      throw new NotFoundException('Promotion not found');
    }

    await this.prisma.promotion.update({
      where: {
        id: promotionId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  private toBannerEntity(banner: {
    id: string;
    title: string;
    image_url: string;
    link_url: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): BannerEntity {
    return new BannerEntity(
      banner.id,
      banner.title,
      banner.image_url,
      banner.link_url,
      banner.is_active,
      banner.created_at,
      banner.updated_at,
    );
  }

  private toPromotionEntity(promotion: {
    id: string;
    title: string;
    description: string | null;
    discount_type: string;
    discount_value: unknown;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): PromotionEntity {
    return new PromotionEntity(
      promotion.id,
      promotion.title,
      promotion.description,
      promotion.discount_type,
      Number(promotion.discount_value),
      promotion.start_date,
      promotion.end_date,
      promotion.is_active,
      promotion.created_at,
      promotion.updated_at,
    );
  }
}
