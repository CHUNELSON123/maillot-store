import {
  Body,
  Controller,
  Patch,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

import { CreateCommissionUseCase } from '../../application/use-cases/create-commission.use-case';
import { GetCommissionUseCase } from '../../application/use-cases/get-commission.use-case';
import { GetInfluencerCommissionsUseCase } from '../../application/use-cases/get-influencer-commissions.use-case';
import { CreateCommissionDto } from '../dto/create-commission.dto';

import { UpdateCommissionStatusUseCase } from '../../application/use-cases/update-commission-status.use-case';
import { UpdateCommissionStatusDto } from '../dto/update-commission-status.dto';

@Controller({
  path: 'commissions',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionController {
  constructor(
    private readonly createCommissionUseCase: CreateCommissionUseCase,
    private readonly getCommissionUseCase: GetCommissionUseCase,
    private readonly getInfluencerCommissionsUseCase: GetInfluencerCommissionsUseCase,
    private readonly updateCommissionStatusUseCase: UpdateCommissionStatusUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateCommissionDto) {
    return this.createCommissionUseCase.execute({
      referralId: dto.referralId,
    });
  }

  @Get(':id')
  @Roles('Administrator', 'Staff')
  getOne(@Param('id') commissionId: string) {
    return this.getCommissionUseCase.execute(commissionId);
  }

  @Get('influencer/:influencerId')
  @Roles('Administrator', 'Staff')
  getByInfluencer(@Param('influencerId') influencerId: string) {
    return this.getInfluencerCommissionsUseCase.execute(influencerId);
  }

  @Patch(':id/status')
  @Roles('Administrator', 'Staff')
  updateStatus(
    @Param('id') commissionId: string,
    @Body() dto: UpdateCommissionStatusDto,
  ) {
    return this.updateCommissionStatusUseCase.execute(commissionId, dto);
  }
}
