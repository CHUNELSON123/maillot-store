import { Body, Controller, Post } from '@nestjs/common';
import { CreateReferralClickUseCase } from '../../application/use-cases/create-referral-click.use-case';
import { CreateReferralClickDto } from '../dto/create-referral-click.dto';

@Controller({ path: 'influencers/referrals', version: '1' })
export class ReferralClickController {
  constructor(private readonly createReferralClick: CreateReferralClickUseCase) {}

  @Post('click')
  track(@Body() dto: CreateReferralClickDto) {
    return this.createReferralClick.execute(dto.referralCode);
  }
}
