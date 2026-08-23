import { Injectable } from '@nestjs/common';
import {
  CmsRepository,
  CreatePromotionData,
} from '../../domain/repositories/cms.repository';

@Injectable()
export class CreatePromotionUseCase {
  constructor(private readonly cmsRepository: CmsRepository) {}

  execute(data: CreatePromotionData) {
    return this.cmsRepository.createPromotion(data);
  }
}
