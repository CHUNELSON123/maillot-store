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
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { GetPaymentUseCase } from '../../application/use-cases/get-payment.use-case';
import { UpdatePaymentStatusUseCase } from '../../application/use-cases/update-payment-status.use-case';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentStatusDto } from '../dto/update-payment-status.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@Controller({
  path: 'payments',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly updatePaymentStatusUseCase: UpdatePaymentStatusUseCase,
  ) {}

  @Post()
  @Roles('Customer')
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreatePaymentDto) {
    return this.createPaymentUseCase.execute({
      userId: request.user.id,
      orderId: dto.orderId,
      paymentMethodId: dto.paymentMethodId,
      transactionReference: dto.transactionReference,
    });
  }

  @Get(':orderId')
  @Roles('Customer')
  getPayment(
    @Req() request: AuthenticatedRequest,
    @Param('orderId') orderId: string,
  ) {
    return this.getPaymentUseCase.execute(request.user.id, orderId);
  }

  @Patch(':id/status')
  @Roles('Administrator', 'Staff')
  updateStatus(
    @Param('id') paymentId: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.updatePaymentStatusUseCase.execute(paymentId, dto);
  }
}
