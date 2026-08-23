import { Injectable } from '@nestjs/common';
import { CmsRepository } from '../../domain/repositories/cms.repository';

@Injectable()
export class DeleteBannerUseCase {
  constructor(private readonly cmsRepository: CmsRepository) {}

  async execute(bannerId: string) {
    await this.cmsRepository.deleteBanner(bannerId);

    return {
      message: 'Banner deleted successfully',
    };
  }
}
