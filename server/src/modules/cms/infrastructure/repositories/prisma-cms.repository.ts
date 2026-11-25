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

  async getPublicContent(): Promise<Record<string, string>> {
    const keys = [
      'cms.featured_product_ids',
      'cms.home.hero.title', 'cms.home.hero.tagline', 'cms.home.hero.description', 'cms.home.hero.primary_label', 'cms.home.hero.secondary_label', 'cms.home.hero.secondary_link',
      'cms.about.title', 'cms.about.subtitle', 'cms.about.description', 'cms.about.tagline', 'cms.about.image',
      ...[1, 2, 3, 4].flatMap((index) => [`cms.about.feature${index}.title`, `cms.about.feature${index}.description`]),
      'cms.contact.title', 'cms.contact.subtitle', 'cms.contact.information_title', 'cms.contact.information_intro', 'cms.contact.form_title', 'cms.contact.form_intro', 'cms.contact.map_title',
      'cms.contact.address', 'cms.contact.address_line', 'cms.contact.quarter', 'cms.contact.city', 'cms.contact.region', 'cms.contact.country',
      'cms.contact.phone', 'cms.contact.email', 'cms.contact.hours', 'cms.contact.hours.weekdays.open', 'cms.contact.hours.weekdays.close', 'cms.contact.hours.saturday.open', 'cms.contact.hours.saturday.close', 'cms.contact.hours.sunday.open', 'cms.contact.hours.sunday.close', 'cms.contact.hours.sunday_closed',
      'site_name', 'site_tagline', 'site_logo_url', 'site_favicon_url', 'default_currency', 'maintenance_mode', 'business_name', 'business_email', 'business_phone', 'business_address', 'business_tax_id', 'whatsapp_number', 'social_tiktok', 'social_facebook', 'social_snapchat', 'social_x', 'delivery_enabled', 'delivery_fee', 'free_delivery_threshold', 'delivery_information', 'payment_methods_enabled', 'payment_instructions',
    ];
    const settings = await this.prisma.systemSetting.findMany({
      where: { deleted_at: null, key: { in: keys } },
      select: { key: true, value: true },
    });
    const content = Object.fromEntries(settings.map(({ key, value }) => [key, value]));
    for (const key of ['site_name', 'site_tagline', 'site_logo_url', 'site_favicon_url', 'default_currency', 'maintenance_mode', 'business_name', 'business_email', 'business_phone', 'business_address', 'business_tax_id', 'whatsapp_number', 'social_tiktok', 'social_facebook', 'social_snapchat', 'social_x', 'delivery_enabled', 'delivery_fee', 'free_delivery_threshold', 'delivery_information', 'payment_methods_enabled', 'payment_instructions']) {
      if (content[key] !== undefined) content[`store.${key}`] = content[key];
    }
    const address = [content['cms.contact.address_line'], content['cms.contact.quarter'], content['cms.contact.city'], content['cms.contact.region'], content['cms.contact.country']].map((part) => part?.trim()).filter(Boolean).join(', ');
    const displayTime = (time?: string) => { if (!time) return ''; const [hour, minute] = time.split(':').map(Number); if (!Number.isFinite(hour) || !Number.isFinite(minute)) return ''; return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`; };
    const hourRange = (key: string) => { const open = displayTime(content[`cms.contact.hours.${key}.open`]); const close = displayTime(content[`cms.contact.hours.${key}.close`]); return open && close ? `${open} – ${close}` : ''; };
    const weekdayHours = hourRange('weekdays'); const saturdayHours = hourRange('saturday'); const sundayHours = hourRange('sunday');
    const hours = [
      weekdayHours && `Monday – Friday: ${weekdayHours}`,
      saturdayHours && `Saturday: ${saturdayHours}`,
      content['cms.contact.hours.sunday_closed'] === 'true' ? 'Sunday: Closed' : sundayHours && `Sunday: ${sundayHours}`,
    ].filter(Boolean).join('\n');
    return {
      ...content,
      'cms.contact.address': content['cms.contact.address'] || address || content.business_address || '',
      'cms.contact.phone': content['cms.contact.phone'] || content.business_phone || '',
      'cms.contact.email': content['cms.contact.email'] || content.business_email || '',
      'cms.contact.hours': content['cms.contact.hours'] || hours || '',
    };
  }

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

    await this.savePromotionMetadata(promotion.id, {
      imageUrl: data.imageUrl ?? null,
      targetType: data.targetType,
      targetIds: data.targetIds,
    });

    return this.toPromotionEntity(promotion, {
      imageUrl: data.imageUrl ?? null,
      targetType: data.targetType,
      targetIds: data.targetIds,
    });
  }

  async findPromotions(activeOnly = false): Promise<PromotionEntity[]> {
    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: {
        deleted_at: null,
        ...(activeOnly
          ? {
              is_active: true,
              start_date: { lte: now },
              end_date: { gte: now },
            }
          : {}),
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const metadata = await this.getPromotionMetadata(promotions.map(({ id }) => id));
    return promotions.map((promotion) => this.toPromotionEntity(promotion, metadata[promotion.id]));
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

    const currentMetadata = (await this.getPromotionMetadata([promotionId]))[promotionId] ?? {
      imageUrl: null,
      targetType: 'ALL',
      targetIds: [],
    };
    const nextMetadata = {
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : currentMetadata.imageUrl,
      targetType: data.targetType ?? currentMetadata.targetType,
      targetIds: data.targetIds ?? currentMetadata.targetIds,
    };
    await this.savePromotionMetadata(promotionId, nextMetadata);

    return this.toPromotionEntity(promotion, nextMetadata);
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
    await this.prisma.systemSetting.updateMany({
      where: { key: `cms.promotion.${promotionId}`, deleted_at: null },
      data: { deleted_at: new Date() },
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

  private async getPromotionMetadata(ids: string[]): Promise<Record<string, { imageUrl: string | null; targetType: string; targetIds: string[] }>> {
    if (!ids.length) return {};
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { in: ids.map((id) => `cms.promotion.${id}`) }, deleted_at: null },
      select: { key: true, value: true },
    });
    const result: Record<string, { imageUrl: string | null; targetType: string; targetIds: string[] }> = {};
    for (const setting of settings) {
      try {
        const value = JSON.parse(setting.value) as { imageUrl?: string | null; targetType?: string; targetIds?: string[] };
        result[setting.key.slice('cms.promotion.'.length)] = {
          imageUrl: value.imageUrl ?? null,
          targetType: value.targetType ?? 'ALL',
          targetIds: Array.isArray(value.targetIds) ? value.targetIds : [],
        };
      } catch {
        result[setting.key.slice('cms.promotion.'.length)] = { imageUrl: null, targetType: 'ALL', targetIds: [] };
      }
    }
    return result;
  }

  private async savePromotionMetadata(id: string, metadata: { imageUrl: string | null; targetType: string; targetIds: string[] }) {
    await this.prisma.systemSetting.upsert({
      where: { key: `cms.promotion.${id}` },
      create: { key: `cms.promotion.${id}`, value: JSON.stringify(metadata), description: 'Promotion targeting and display image' },
      update: { value: JSON.stringify(metadata), deleted_at: null },
    });
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
  }, metadata?: { imageUrl: string | null; targetType: string; targetIds: string[] }): PromotionEntity {
    return new PromotionEntity(
      promotion.id,
      promotion.title,
      promotion.description,
      metadata?.imageUrl ?? null,
      promotion.discount_type,
      Number(promotion.discount_value),
      metadata?.targetType ?? 'ALL',
      metadata?.targetIds ?? [],
      promotion.start_date,
      promotion.end_date,
      promotion.is_active,
      promotion.created_at,
      promotion.updated_at,
    );
  }
}
