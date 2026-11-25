import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../../../../common/guards/optional-jwt-auth.guard';
import { NotchPayService } from '../../infrastructure/notchpay.service';
import { MobileMoneyCheckoutDto, NotchCheckoutDto } from '../dto/notch-checkout.dto';

@Controller({ path: 'payments/notchpay', version: '1' })
export class NotchPayController {
  constructor(private readonly notchPay: NotchPayService) {}
  @Post('initialize') @UseGuards(OptionalJwtAuthGuard)
  initialize(@Req() request: { user?: { id: string } }, @Body() dto: NotchCheckoutDto) { return this.notchPay.initialize(dto, request.user?.id); }
  @Post('charge') @UseGuards(OptionalJwtAuthGuard)
  charge(@Req() request: { user?: { id: string } }, @Body() dto: MobileMoneyCheckoutDto) { return this.notchPay.charge(dto, request.user?.id); }
  @Post('cash') @UseGuards(OptionalJwtAuthGuard)
  cash(@Req() request: { user?: { id: string } }, @Body() dto: NotchCheckoutDto) { return this.notchPay.selectCash(dto, request.user?.id); }
  @Post('verify') @UseGuards(OptionalJwtAuthGuard)
  verify(@Req() request: { user?: { id: string } }, @Body() dto: NotchCheckoutDto) { return this.notchPay.verify(dto, request.user?.id); }
}
