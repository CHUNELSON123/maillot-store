import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { storeImage } from '../../../../infrastructure/storage/cloudinary';
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
import { GetPublicContentUseCase } from '../../application/use-cases/get-public-content.use-case';

import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';

@Controller({
  path: 'cms',
  version: '1',
})
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
    private readonly getPublicContentUseCase: GetPublicContentUseCase,
  ) {}

  @Get('public/banners')
  getPublicBanners() {
    return this.getBannersUseCase.execute(true);
  }

  @Get('public/promotions')
  getPublicPromotions() {
    return this.getPromotionsUseCase.execute(true);
  }

  @Get('public/content')
  getPublicContent() {
    return this.getPublicContentUseCase.execute();
  }

  @Post('uploads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
        callback(new BadRequestException('Only image files are allowed'), false);
        return;
      }
      callback(null, true);
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Choose an image file to upload');
    return { imageUrl: await storeImage(file, 'cms') };
  }

  @Post('banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.createBannerUseCase.execute({
      title: dto.title,
      imageUrl: await storeImage(dto.imageUrl, 'cms'),
      linkUrl: dto.linkUrl,
      isActive: dto.isActive,
    });
  }

  @Get('banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff', 'Customer')
  getBanners(@Query('activeOnly') activeOnly?: string) {
    return this.getBannersUseCase.execute(activeOnly === 'true');
  }

  @Patch('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  async updateBanner(@Param('id') bannerId: string, @Body() dto: UpdateBannerDto) {
    return this.updateBannerUseCase.execute(bannerId, { ...dto, imageUrl: dto.imageUrl ? await storeImage(dto.imageUrl, 'cms') : dto.imageUrl });
  }

  @Delete('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  deleteBanner(@Param('id') bannerId: string) {
    return this.deleteBannerUseCase.execute(bannerId);
  }

  @Post('promotions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  async createPromotion(@Body() dto: CreatePromotionDto) {
    return this.createPromotionUseCase.execute({
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl ? await storeImage(dto.imageUrl, 'cms') : dto.imageUrl,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      targetType: dto.targetType ?? 'ALL',
      targetIds: dto.targetIds ?? [],
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isActive: dto.isActive,
    });
  }

  @Get('promotions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff', 'Customer')
  getPromotions(@Query('activeOnly') activeOnly?: string) {
    return this.getPromotionsUseCase.execute(activeOnly === 'true');
  }

  @Patch('promotions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  async updatePromotion(
    @Param('id') promotionId: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.updatePromotionUseCase.execute(promotionId, {
      ...dto,
      imageUrl: dto.imageUrl ? await storeImage(dto.imageUrl, 'cms') : dto.imageUrl,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  @Delete('promotions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  deletePromotion(@Param('id') promotionId: string) {
    return this.deletePromotionUseCase.execute(promotionId);
  }
}
