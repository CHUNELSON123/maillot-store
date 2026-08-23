import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { PrismaInfluencerRepository } from './infrastructure/repositories/prisma-influencer.repository';
import { InfluencerRepository } from './domain/repositories/influencer.repository';
import { PrismaCommissionRepository } from './infrastructure/repositories/prisma-commission.repository';
import { CommissionRepository } from './domain/repositories/commission.repository';

import { CreateInfluencerUseCase } from './application/use-cases/create-influencer.use-case';
import { GetInfluencerUseCase } from './application/use-cases/get-influencer.use-case';
import { GetInfluencersUseCase } from './application/use-cases/get-influencers.use-case';
import { UpdateInfluencerUseCase } from './application/use-cases/update-influencer.use-case';
import { CreateReferralUseCase } from './application/use-cases/create-referral.use-case';
import { GetReferralsUseCase } from './application/use-cases/get-referrals.use-case';
import { ApproveInfluencerUseCase } from './application/use-cases/approve-influencer.use-case';
import { CreateCommissionUseCase } from './application/use-cases/create-commission.use-case';
import { GetCommissionUseCase } from './application/use-cases/get-commission.use-case';
import { GetInfluencerCommissionsUseCase } from './application/use-cases/get-influencer-commissions.use-case';
import { UpdateCommissionStatusUseCase } from './application/use-cases/update-commission-status.use-case';

import { InfluencerController } from './presentation/controllers/influencer.controller';
import { RegisterInfluencerUseCase } from './application/use-cases/register-influencer.use-case';

import { InfluencerRegistrationController } from './presentation/controllers/influencer-registration.controller';
import { CommissionController } from './presentation/controllers/commission.controller';

import { OrdersModule } from '../orders/orders.module';

import { WithdrawalRepository } from './domain/repositories/withdrawal.repository';
import { PrismaWithdrawalRepository } from './infrastructure/repositories/prisma-withdrawal.repository';

import { CreateWithdrawalRequestUseCase } from './application/use-cases/create-withdrawal-request.use-case';
import { GetWithdrawalRequestUseCase } from './application/use-cases/get-withdrawal-request.use-case';
import { GetInfluencerWithdrawalsUseCase } from './application/use-cases/get-influencer-withdrawals.use-case';
import { UpdateWithdrawalStatusUseCase } from './application/use-cases/update-withdrawal-status.use-case';

import { WithdrawalController } from './presentation/controllers/withdrawal.controller';

@Module({
  imports: [AuthModule, OrdersModule],
  controllers: [
    InfluencerController,
    InfluencerRegistrationController,
    CommissionController,
    WithdrawalController,
  ],
  providers: [
    PrismaInfluencerRepository,
    PrismaCommissionRepository,
    GetCommissionUseCase,
    GetInfluencerCommissionsUseCase,

    CreateInfluencerUseCase,
    GetInfluencerUseCase,
    GetInfluencersUseCase,
    UpdateInfluencerUseCase,
    CreateReferralUseCase,
    GetReferralsUseCase,
    RegisterInfluencerUseCase,
    ApproveInfluencerUseCase,
    CreateCommissionUseCase,
    UpdateCommissionStatusUseCase,

    PrismaWithdrawalRepository,

    CreateWithdrawalRequestUseCase,
    GetWithdrawalRequestUseCase,
    GetInfluencerWithdrawalsUseCase,
    UpdateWithdrawalStatusUseCase,

    {
      provide: InfluencerRepository,
      useExisting: PrismaInfluencerRepository,
    },

    {
      provide: CommissionRepository,
      useExisting: PrismaCommissionRepository,
    },

    {
      provide: WithdrawalRepository,
      useExisting: PrismaWithdrawalRepository,
    },
  ],
  exports: [InfluencerRepository],
})
export class InfluencersModule {}
