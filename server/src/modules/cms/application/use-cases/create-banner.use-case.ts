import { Injectable } from '@nestjs/common';
import {
  CmsRepository,
  CreateBannerData,
} from '../../domain/repositories/cms.repository';

@Injectable()
export class CreateBannerUseCase {
  constructor(private readonly cmsRepository: CmsRepository) {}

  execute(data: CreateBannerData) {
    return this.cmsRepository.createBanner(data);
  }
}
