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

import { CreatePurchaseUseCase } from '../../application/use-cases/create-purchase.use-case';
import { GetPurchasesUseCase } from '../../application/use-cases/get-purchases.use-case';
import { GetPurchaseUseCase } from '../../application/use-cases/get-purchase.use-case';
import { UpdatePurchaseStatusUseCase } from '../../application/use-cases/update-purchase-status.use-case';

import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { UpdatePurchaseStatusDto } from '../dto/update-purchase-status.dto';

@Controller({
  path: 'purchases',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseController {
  constructor(
    private readonly createPurchaseUseCase: CreatePurchaseUseCase,
    private readonly getPurchasesUseCase: GetPurchasesUseCase,
    private readonly getPurchaseUseCase: GetPurchaseUseCase,
    private readonly updatePurchaseStatusUseCase: UpdatePurchaseStatusUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreatePurchaseDto) {
    return this.createPurchaseUseCase.execute({
      supplierId: dto.supplierId,
      purchaseNumber: dto.purchaseNumber,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
      items: dto.items,
    });
  }

  @Get()
  @Roles('Administrator', 'Staff')
  findAll() {
    return this.getPurchasesUseCase.execute();
  }

  @Get(':id')
  @Roles('Administrator', 'Staff')
  findOne(@Param('id') purchaseId: string) {
    return this.getPurchaseUseCase.execute(purchaseId);
  }

  @Patch(':id/status')
  @Roles('Administrator', 'Staff')
  updateStatus(
    @Param('id') purchaseId: string,
    @Body() dto: UpdatePurchaseStatusDto,
  ) {
    return this.updatePurchaseStatusUseCase.execute(purchaseId, dto);
  }
}
