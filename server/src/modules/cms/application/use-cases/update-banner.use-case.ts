import { Injectable } from '@nestjs/common';
import {
  CmsRepository,
  UpdateBannerData,
} from '../../domain/repositories/cms.repository';

@Injectable()
export class UpdateBannerUseCase {
  constructor(private readonly cmsRepository: CmsRepository) {}

  execute(bannerId: string, data: UpdateBannerData) {
    return this.cmsRepository.updateBanner(bannerId, data);
  }
}
