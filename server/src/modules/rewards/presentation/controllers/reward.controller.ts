import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

import { CreateRewardRuleUseCase } from '../../application/use-cases/create-reward-rule.use-case';
import { GetRewardRulesUseCase } from '../../application/use-cases/get-reward-rules.use-case';
import { UpdateRewardRuleUseCase } from '../../application/use-cases/update-reward-rule.use-case';
import { AwardRewardUseCase } from '../../application/use-cases/award-reward.use-case';
import { GetCustomerRewardsUseCase } from '../../application/use-cases/get-customer-rewards.use-case';
import { RedeemRewardUseCase } from '../../application/use-cases/redeem-reward.use-case';

import { CreateRewardRuleDto } from '../dto/create-reward-rule.dto';
import { UpdateRewardRuleDto } from '../dto/update-reward-rule.dto';
import { AwardRewardDto } from '../dto/award-reward.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@Controller({
  path: 'rewards',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardController {
  constructor(
    private readonly createRewardRuleUseCase: CreateRewardRuleUseCase,
    private readonly getRewardRulesUseCase: GetRewardRulesUseCase,
    private readonly updateRewardRuleUseCase: UpdateRewardRuleUseCase,
    private readonly awardRewardUseCase: AwardRewardUseCase,
    private readonly getCustomerRewardsUseCase: GetCustomerRewardsUseCase,
    private readonly redeemRewardUseCase: RedeemRewardUseCase,
  ) {}

  @Post('rules')
  @Roles('Administrator', 'Staff')
  createRule(@Body() dto: CreateRewardRuleDto) {
    return this.createRewardRuleUseCase.execute({
      name: dto.name,
      purchaseCountThreshold: dto.purchaseCountThreshold,
      spendingThreshold: dto.spendingThreshold,
      rewardType: dto.rewardType,
      rewardValue: dto.rewardValue,
      giftDescription: dto.giftDescription,
    });
  }

  @Get('rules')
  @Roles('Administrator', 'Staff')
  getRules() {
    return this.getRewardRulesUseCase.execute();
  }

  @Patch('rules/:id')
  @Roles('Administrator', 'Staff')
  updateRule(@Param('id') ruleId: string, @Body() dto: UpdateRewardRuleDto) {
    return this.updateRewardRuleUseCase.execute(ruleId, dto);
  }

  @Post('award')
  @Roles('Administrator', 'Staff')
  awardReward(@Body() dto: AwardRewardDto) {
    return this.awardRewardUseCase.execute({
      customerId: dto.customerId,
      rewardRuleId: dto.rewardRuleId,
    });
  }

  @Get('customer')
  @Roles('Customer')
  getCustomerRewards(@Req() request: AuthenticatedRequest) {
    return this.getCustomerRewardsUseCase.execute(request.user.id);
  }

  @Patch(':id/redeem')
  @Roles('Customer')
  redeemReward(
    @Req() request: AuthenticatedRequest,
    @Param('id') rewardId: string,
  ) {
    return this.redeemRewardUseCase.execute(rewardId, request.user.id);
  }
}
