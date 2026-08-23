import {
  Body,
  Controller,
  Delete,
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

import { GetCustomerProfileUseCase } from '../../application/use-cases/get-customer-profile.use-case';
import { UpdateCustomerProfileUseCase } from '../../application/use-cases/update-customer-profile.use-case';
import { GetCustomerAddressesUseCase } from '../../application/use-cases/get-customer-addresses.use-case';
import { CreateCustomerAddressUseCase } from '../../application/use-cases/create-customer-address.use-case';
import { UpdateCustomerAddressUseCase } from '../../application/use-cases/update-customer-address.use-case';
import { DeleteCustomerAddressUseCase } from '../../application/use-cases/delete-customer-address.use-case';

import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { CreateCustomerAddressDto } from '../dto/create-customer-address.dto';
import { UpdateCustomerAddressDto } from '../dto/update-customer-address.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
  };
}

@Controller({
  path: 'customers',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Customer')
export class CustomerController {
  constructor(
    private readonly getCustomerProfileUseCase: GetCustomerProfileUseCase,
    private readonly updateCustomerProfileUseCase: UpdateCustomerProfileUseCase,
    private readonly getCustomerAddressesUseCase: GetCustomerAddressesUseCase,
    private readonly createCustomerAddressUseCase: CreateCustomerAddressUseCase,
    private readonly updateCustomerAddressUseCase: UpdateCustomerAddressUseCase,
    private readonly deleteCustomerAddressUseCase: DeleteCustomerAddressUseCase,
  ) {}

  @Get('profile')
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.getCustomerProfileUseCase.execute(request.user.id);
  }

  @Patch('profile')
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.updateCustomerProfileUseCase.execute(request.user.id, dto);
  }

  @Get('addresses')
  getAddresses(@Req() request: AuthenticatedRequest) {
    return this.getCustomerAddressesUseCase.execute(request.user.id);
  }

  @Post('addresses')
  createAddress(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateCustomerAddressDto,
  ) {
    return this.createCustomerAddressUseCase.execute(request.user.id, dto);
  }

  @Patch('addresses/:id')
  updateAddress(
    @Req() request: AuthenticatedRequest,
    @Param('id') addressId: string,
    @Body() dto: UpdateCustomerAddressDto,
  ) {
    return this.updateCustomerAddressUseCase.execute(
      request.user.id,
      addressId,
      dto,
    );
  }

  @Delete('addresses/:id')
  deleteAddress(
    @Req() request: AuthenticatedRequest,
    @Param('id') addressId: string,
  ) {
    return this.deleteCustomerAddressUseCase.execute(
      request.user.id,
      addressId,
    );
  }
}
