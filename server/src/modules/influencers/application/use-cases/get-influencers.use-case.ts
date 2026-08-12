import { Injectable } from '@nestjs/common';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';

@Injectable()
export class GetInfluencersUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute() {
    return this.influencerRepository.findAll();
  }
}
