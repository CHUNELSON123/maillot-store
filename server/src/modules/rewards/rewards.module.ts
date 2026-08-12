import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { PrismaRewardRepository } from './infrastructure/repositories/prisma-reward.repository';
import { RewardRepository } from './domain/repositories/reward.repository';

import { CreateRewardRuleUseCase } from './application/use-cases/create-reward-rule.use-case';
import { GetRewardRulesUseCase } from './application/use-cases/get-reward-rules.use-case';
import { UpdateRewardRuleUseCase } from './application/use-cases/update-reward-rule.use-case';
import { AwardRewardUseCase } from './application/use-cases/award-reward.use-case';
import { GetCustomerRewardsUseCase } from './application/use-cases/get-customer-rewards.use-case';
import { RedeemRewardUseCase } from './application/use-cases/redeem-reward.use-case';

import { RewardController } from './presentation/controllers/reward.controller';

@Module({
  imports: [AuthModule],
  controllers: [RewardController],
  providers: [
    PrismaRewardRepository,

    CreateRewardRuleUseCase,
    GetRewardRulesUseCase,
    UpdateRewardRuleUseCase,
    AwardRewardUseCase,
    GetCustomerRewardsUseCase,
    RedeemRewardUseCase,

    {
      provide: RewardRepository,
      useExisting: PrismaRewardRepository,
    },
  ],
  exports: [RewardRepository],
})
export class RewardsModule {}
