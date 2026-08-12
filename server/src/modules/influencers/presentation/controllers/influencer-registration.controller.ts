import { Body, Controller, Post } from '@nestjs/common';

import { RegisterInfluencerUseCase } from '../../application/use-cases/register-influencer.use-case';
import { RegisterInfluencerDto } from '../dto/register-influencer.dto';

@Controller({
  path: 'influencers',
  version: '1',
})
export class InfluencerRegistrationController {
  constructor(
    private readonly registerInfluencerUseCase: RegisterInfluencerUseCase,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterInfluencerDto) {
    return this.registerInfluencerUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }
}
