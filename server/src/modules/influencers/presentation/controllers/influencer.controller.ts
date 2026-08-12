import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

import { CreateInfluencerUseCase } from '../../application/use-cases/create-influencer.use-case';
import { GetInfluencerUseCase } from '../../application/use-cases/get-influencer.use-case';
import { GetInfluencersUseCase } from '../../application/use-cases/get-influencers.use-case';
import { UpdateInfluencerUseCase } from '../../application/use-cases/update-influencer.use-case';
import { CreateReferralUseCase } from '../../application/use-cases/create-referral.use-case';
import { GetReferralsUseCase } from '../../application/use-cases/get-referrals.use-case';
import { ApproveInfluencerUseCase } from '../../application/use-cases/approve-influencer.use-case';

import { CreateInfluencerDto } from '../dto/create-influencer.dto';
import { UpdateInfluencerDto } from '../dto/update-influencer.dto';
import { CreateReferralDto } from '../dto/create-referral.dto';

@Controller({
  path: 'influencers',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class InfluencerController {
  constructor(
    private readonly createInfluencerUseCase: CreateInfluencerUseCase,
    private readonly getInfluencerUseCase: GetInfluencerUseCase,
    private readonly getInfluencersUseCase: GetInfluencersUseCase,
    private readonly updateInfluencerUseCase: UpdateInfluencerUseCase,
    private readonly createReferralUseCase: CreateReferralUseCase,
    private readonly getReferralsUseCase: GetReferralsUseCase,
    private readonly approveInfluencerUseCase: ApproveInfluencerUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateInfluencerDto) {
    return this.createInfluencerUseCase.execute({
      userId: dto.userId,
      referralCode: dto.referralCode,
      status: dto.status,
      commissionRate: dto.commissionRate,
      customerDiscountRate: dto.customerDiscountRate,
    });
  }

  @Get()
  @Roles('Administrator', 'Staff')
  getAll() {
    return this.getInfluencersUseCase.execute();
  }

  @Get(':id')
  @Roles('Administrator', 'Staff')
  getOne(@Param('id') influencerId: string) {
    return this.getInfluencerUseCase.execute(influencerId);
  }

  @Patch(':id')
  @Roles('Administrator', 'Staff')
  update(@Param('id') influencerId: string, @Body() dto: UpdateInfluencerDto) {
    return this.updateInfluencerUseCase.execute(influencerId, dto);
  }

  @Post('referrals')
  @Roles('Administrator', 'Staff')
  createReferral(@Body() dto: CreateReferralDto) {
    return this.createReferralUseCase.execute({
      influencerId: dto.influencerId,
      orderId: dto.orderId,
      referralCode: dto.referralCode,
      status: dto.status,
    });
  }

  @Get(':id/referrals')
  @Roles('Administrator', 'Staff')
  getReferrals(@Param('id') influencerId: string) {
    return this.getReferralsUseCase.execute(influencerId);
  }

  @Patch(':id/approve')
  @Roles('Administrator')
  approve(@Param('id') influencerId: string) {
    return this.approveInfluencerUseCase.execute(influencerId);
  }
}
