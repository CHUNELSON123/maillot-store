import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CustomerRepository } from '../../../customers/domain/repositories/customer.repository';

import { GetCartUseCase } from '../../application/use-cases/get-cart.use-case';
import { AddCartItemUseCase } from '../../application/use-cases/add-cart-item.use-case';
import { UpdateCartItemUseCase } from '../../application/use-cases/update-cart-item.use-case';
import { RemoveCartItemUseCase } from '../../application/use-cases/remove-cart-item.use-case';
import { ClearCartUseCase } from '../../application/use-cases/clear-cart.use-case';
import { SyncCartUseCase } from '../../application/use-cases/sync-cart.use-case';

import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { SyncCartDto } from '../dto/sync-cart.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller({
  path: 'cart',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Customer')
export class CartController {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addCartItemUseCase: AddCartItemUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeCartItemUseCase: RemoveCartItemUseCase,
    private readonly clearCartUseCase: ClearCartUseCase,
    private readonly syncCartUseCase: SyncCartUseCase,
  ) {}

  @Get()
  async getCart(@Req() request: AuthenticatedRequest) {
    const customer = await this.getCustomer(request.user.id);
    return this.getCartUseCase.execute(customer.id);
  }

  @Post('items')
  async addItem(
    @Req() request: AuthenticatedRequest,
    @Body() dto: AddCartItemDto,
  ) {
    const customer = await this.getCustomer(request.user.id);
    return this.addCartItemUseCase.execute(
      customer.id,
      dto.productId,
      dto.variantId ?? null,
      dto.quantity ?? 1,
    );
  }

  @Put('items/:id')
  async updateItem(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const customer = await this.getCustomer(request.user.id);
    return this.updateCartItemUseCase.execute(
      customer.id,
      id,
      dto.quantity,
      dto.variantId,
    );
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    const customer = await this.getCustomer(request.user.id);
    await this.removeCartItemUseCase.execute(customer.id, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Req() request: AuthenticatedRequest): Promise<void> {
    const customer = await this.getCustomer(request.user.id);
    await this.clearCartUseCase.execute(customer.id);
  }

  @Post('sync')
  async syncCart(
    @Req() request: AuthenticatedRequest,
    @Body() dto: SyncCartDto,
  ) {
    const customer = await this.getCustomer(request.user.id);
    return this.syncCartUseCase.execute(customer.id, dto.items);
  }

  private async getCustomer(userId: string) {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }
}
