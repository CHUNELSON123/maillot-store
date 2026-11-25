import { Injectable } from '@nestjs/common';
import { CmsRepository } from '../../domain/repositories/cms.repository';

@Injectable()
export class GetPublicContentUseCase {
  constructor(private readonly cmsRepository: CmsRepository) {}

  execute() {
    return this.cmsRepository.getPublicContent();
  }
}
