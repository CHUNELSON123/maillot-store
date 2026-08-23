import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

import { CreateBannerUseCase } from '../../application/use-cases/create-banner.use-case';
import { GetBannersUseCase } from '../../application/use-cases/get-banners.use-case';
import { UpdateBannerUseCase } from '../../application/use-cases/update-banner.use-case';
import { DeleteBannerUseCase } from '../../application/use-cases/delete-banner.use-case';

import { CreatePromotionUseCase } from '../../application/use-cases/create-promotion.use-case';
import { GetPromotionsUseCase } from '../../application/use-cases/get-promotions.use-case';
import { UpdatePromotionUseCase } from '../../application/use-cases/update-promotion.use-case';
import { DeletePromotionUseCase } from '../../application/use-cases/delete-promotion.use-case';

import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';

@Controller({
  path: 'cms',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class CmsController {
  constructor(
    private readonly createBannerUseCase: CreateBannerUseCase,
    private readonly getBannersUseCase: GetBannersUseCase,
    private readonly updateBannerUseCase: UpdateBannerUseCase,
    private readonly deleteBannerUseCase: DeleteBannerUseCase,
    private readonly createPromotionUseCase: CreatePromotionUseCase,
    private readonly getPromotionsUseCase: GetPromotionsUseCase,
    private readonly updatePromotionUseCase: UpdatePromotionUseCase,
    private readonly deletePromotionUseCase: DeletePromotionUseCase,
  ) {}

  @Post('banners')
  @Roles('Administrator', 'Staff')
  createBanner(@Body() dto: CreateBannerDto) {
    return this.createBannerUseCase.execute({
      title: dto.title,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl,
      isActive: dto.isActive,
    });
  }

  @Get('banners')
  @Roles('Administrator', 'Staff', 'Customer')
  getBanners(@Query('activeOnly') activeOnly?: string) {
    return this.getBannersUseCase.execute(activeOnly === 'true');
  }

  @Patch('banners/:id')
  @Roles('Administrator', 'Staff')
  updateBanner(@Param('id') bannerId: string, @Body() dto: UpdateBannerDto) {
    return this.updateBannerUseCase.execute(bannerId, dto);
  }

  @Delete('banners/:id')
  @Roles('Administrator', 'Staff')
  deleteBanner(@Param('id') bannerId: string) {
    return this.deleteBannerUseCase.execute(bannerId);
  }

  @Post('promotions')
  @Roles('Administrator', 'Staff')
  createPromotion(@Body() dto: CreatePromotionDto) {
    return this.createPromotionUseCase.execute({
      title: dto.title,
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isActive: dto.isActive,
    });
  }

  @Get('promotions')
  @Roles('Administrator', 'Staff', 'Customer')
  getPromotions(@Query('activeOnly') activeOnly?: string) {
    return this.getPromotionsUseCase.execute(activeOnly === 'true');
  }

  @Patch('promotions/:id')
  @Roles('Administrator', 'Staff')
  updatePromotion(
    @Param('id') promotionId: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.updatePromotionUseCase.execute(promotionId, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  @Delete('promotions/:id')
  @Roles('Administrator', 'Staff')
  deletePromotion(@Param('id') promotionId: string) {
    return this.deletePromotionUseCase.execute(promotionId);
  }
}
