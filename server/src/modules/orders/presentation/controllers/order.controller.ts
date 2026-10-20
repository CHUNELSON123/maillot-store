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

import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrdersUseCase } from '../../application/use-cases/get-orders.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';

import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { GuestOrderConfirmationDto } from '../dto/guest-order-confirmation.dto';

import { OptionalJwtAuthGuard } from '../../../../common/guards/optional-jwt-auth.guard';

interface AuthenticatedRequest {
  user?: {
    id: string;
  };
}

@Controller({
  path: 'orders',
  version: '1',
})
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
  ) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.createOrderUseCase.execute({
      userId: request?.user?.id,
      source: dto.source,
      items: dto.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      referralCode: dto.referralCode,
      referralAttributionToken: dto.referralAttributionToken,
      paymentMethod: dto.paymentMethod,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      guestPhone: dto.guestPhone,
      guestAccessToken: dto.guestAccessToken,
      deliveryMethod: dto.deliveryMethod,
      deliveryAddress: dto.deliveryAddress,
      deliveryCity: dto.deliveryCity,
      deliveryPostalCode: dto.deliveryPostalCode,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  getMyOrders(@Req() request: AuthenticatedRequest) {
    return this.getOrdersUseCase.execute(request.user!.id);
  }

  @Get('number/:orderNumber')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  getMyOrderByNumber(
    @Req() request: AuthenticatedRequest,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.getOrderUseCase.executeByOrderNumber(
      request.user!.id,
      orderNumber,
    );
  }

  @Post('guest/:id/confirmation')
  getGuestOrderConfirmation(
    @Param('id') orderId: string,
    @Body() dto: GuestOrderConfirmationDto,
  ) {
    return this.getOrderUseCase.executeGuest(orderId, dto.guestAccessToken);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  getMyOrder(
    @Req() request: AuthenticatedRequest,
    @Param('id') orderId: string,
  ) {
    return this.getOrderUseCase.execute(request.user!.id, orderId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusUseCase.execute(orderId, dto);
  }
}
