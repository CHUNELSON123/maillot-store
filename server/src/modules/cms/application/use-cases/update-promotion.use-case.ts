import { Injectable } from '@nestjs/common';
import {
  CmsRepository,
  UpdatePromotionData,
} from '../../domain/repositories/cms.repository';

@Injectable()
export class UpdatePromotionUseCase {
  constructor(private readonly cmsRepository: CmsRepository) {}

  execute(promotionId: string, data: UpdatePromotionData) {
    return this.cmsRepository.updatePromotion(promotionId, data);
  }
}
