import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

import { CustomerRepository } from '../../../customers/domain/repositories/customer.repository';

import { GetWishlistUseCase } from '../../application/use-cases/get-wishlist.use-case';
import { AddWishlistItemUseCase } from '../../application/use-cases/add-wishlist-item.use-case';
import { RemoveWishlistItemUseCase } from '../../application/use-cases/remove-wishlist-item.use-case';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller({
  path: 'wishlist',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Customer')
export class WishlistController {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly getWishlistUseCase: GetWishlistUseCase,
    private readonly addWishlistItemUseCase: AddWishlistItemUseCase,
    private readonly removeWishlistItemUseCase: RemoveWishlistItemUseCase,
  ) {}

  @Get()
  async getWishlist(@Req() request: AuthenticatedRequest) {
    const customer = await this.getCustomer(request.user.id);

    return this.getWishlistUseCase.execute(customer.id);
  }

  @Post(':productId')
  async addItem(
    @Req() request: AuthenticatedRequest,
    @Param('productId') productId: string,
  ) {
    const customer = await this.getCustomer(request.user.id);

    return this.addWishlistItemUseCase.execute(customer.id, productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Req() request: AuthenticatedRequest,
    @Param('productId') productId: string,
  ): Promise<void> {
    const customer = await this.getCustomer(request.user.id);

    await this.removeWishlistItemUseCase.execute(
      customer.id,
      productId,
    );
  }

  private async getCustomer(userId: string) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}