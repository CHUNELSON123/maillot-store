import { Injectable } from '@nestjs/common';
import { CmsRepository } from '../../domain/repositories/cms.repository';

@Injectable()
export class GetBannersUseCase {
  constructor(private readonly cmsRepository: CmsRepository) {}

  execute(activeOnly = false) {
    return this.cmsRepository.findBanners(activeOnly);
  }
}
