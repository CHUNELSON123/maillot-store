import { Injectable } from '@nestjs/common';
import { CmsRepository } from '../../domain/repositories/cms.repository';

@Injectable()
export class DeletePromotionUseCase {
  constructor(private readonly cmsRepository: CmsRepository) {}

  async execute(promotionId: string) {
    await this.cmsRepository.deletePromotion(promotionId);

    return {
      message: 'Promotion deleted successfully',
    };
  }
}
