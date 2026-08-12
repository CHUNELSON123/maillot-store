import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { PrismaInfluencerRepository } from './infrastructure/repositories/prisma-influencer.repository';
import { InfluencerRepository } from './domain/repositories/influencer.repository';

import { CreateInfluencerUseCase } from './application/use-cases/create-influencer.use-case';
import { GetInfluencerUseCase } from './application/use-cases/get-influencer.use-case';
import { GetInfluencersUseCase } from './application/use-cases/get-influencers.use-case';
import { UpdateInfluencerUseCase } from './application/use-cases/update-influencer.use-case';
import { CreateReferralUseCase } from './application/use-cases/create-referral.use-case';
import { GetReferralsUseCase } from './application/use-cases/get-referrals.use-case';
import { ApproveInfluencerUseCase } from './application/use-cases/approve-influencer.use-case';

import { InfluencerController } from './presentation/controllers/influencer.controller';
import { RegisterInfluencerUseCase } from './application/use-cases/register-influencer.use-case';

import { InfluencerRegistrationController } from './presentation/controllers/influencer-registration.controller';

@Module({
  imports: [AuthModule],
  controllers: [InfluencerController, InfluencerRegistrationController],
  providers: [
    PrismaInfluencerRepository,

    CreateInfluencerUseCase,
    GetInfluencerUseCase,
    GetInfluencersUseCase,
    UpdateInfluencerUseCase,
    CreateReferralUseCase,
    GetReferralsUseCase,
    RegisterInfluencerUseCase,
    ApproveInfluencerUseCase,

    {
      provide: InfluencerRepository,
      useExisting: PrismaInfluencerRepository,
    },
  ],
  exports: [InfluencerRepository],
})
export class InfluencersModule {}
