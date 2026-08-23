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

import { CreateWithdrawalRequestUseCase } from '../../application/use-cases/create-withdrawal-request.use-case';
import { GetWithdrawalRequestUseCase } from '../../application/use-cases/get-withdrawal-request.use-case';
import { GetInfluencerWithdrawalsUseCase } from '../../application/use-cases/get-influencer-withdrawals.use-case';
import { UpdateWithdrawalStatusUseCase } from '../../application/use-cases/update-withdrawal-status.use-case';

import { CreateWithdrawalRequestDto } from '../dto/create-withdrawal-request.dto';
import { UpdateWithdrawalStatusDto } from '../dto/update-withdrawal-status.dto';

@Controller({
  path: 'withdrawals',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalController {
  constructor(
    private readonly createWithdrawalRequestUseCase: CreateWithdrawalRequestUseCase,
    private readonly getWithdrawalRequestUseCase: GetWithdrawalRequestUseCase,
    private readonly getInfluencerWithdrawalsUseCase: GetInfluencerWithdrawalsUseCase,
    private readonly updateWithdrawalStatusUseCase: UpdateWithdrawalStatusUseCase,
  ) {}

  @Post('influencer/:influencerId')
  @Roles('Administrator', 'Staff', 'Influencer')
  create(
    @Param('influencerId') influencerId: string,
    @Body() dto: CreateWithdrawalRequestDto,
  ) {
    return this.createWithdrawalRequestUseCase.execute({
      influencerId,
      amount: dto.amount,
    });
  }

  @Get(':id')
  @Roles('Administrator', 'Staff', 'Influencer')
  getOne(@Param('id') withdrawalId: string) {
    return this.getWithdrawalRequestUseCase.execute(withdrawalId);
  }

  @Get('influencer/:influencerId')
  @Roles('Administrator', 'Staff', 'Influencer')
  getByInfluencer(@Param('influencerId') influencerId: string) {
    return this.getInfluencerWithdrawalsUseCase.execute(influencerId);
  }

  @Patch(':id/status')
  @Roles('Administrator', 'Staff')
  updateStatus(
    @Param('id') withdrawalId: string,
    @Body() dto: UpdateWithdrawalStatusDto,
  ) {
    return this.updateWithdrawalStatusUseCase.execute(withdrawalId, dto);
  }
}
