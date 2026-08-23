import { Module } from '@nestjs/common';

import { CmsController } from './presentation/controllers/cms.controller';

import { PrismaCmsRepository } from './infrastructure/repositories/prisma-cms.repository';
import { CmsRepository } from './domain/repositories/cms.repository';

import { CreateBannerUseCase } from './application/use-cases/create-banner.use-case';
import { GetBannersUseCase } from './application/use-cases/get-banners.use-case';
import { UpdateBannerUseCase } from './application/use-cases/update-banner.use-case';
import { DeleteBannerUseCase } from './application/use-cases/delete-banner.use-case';

import { CreatePromotionUseCase } from './application/use-cases/create-promotion.use-case';
import { GetPromotionsUseCase } from './application/use-cases/get-promotions.use-case';
import { UpdatePromotionUseCase } from './application/use-cases/update-promotion.use-case';
import { DeletePromotionUseCase } from './application/use-cases/delete-promotion.use-case';

@Module({
  controllers: [CmsController],

  providers: [
    PrismaCmsRepository,

    CreateBannerUseCase,
    GetBannersUseCase,
    UpdateBannerUseCase,
    DeleteBannerUseCase,

    CreatePromotionUseCase,
    GetPromotionsUseCase,
    UpdatePromotionUseCase,
    DeletePromotionUseCase,

    {
      provide: CmsRepository,
      useExisting: PrismaCmsRepository,
    },
  ],

  exports: [CmsRepository],
})
export class CmsModule {}
