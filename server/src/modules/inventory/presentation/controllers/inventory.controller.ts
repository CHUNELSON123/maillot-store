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
import { CreateInventoryUseCase } from '../../application/use-cases/create-inventory.use-case';
import { GetInventoryUseCase } from '../../application/use-cases/get-inventory.use-case';
import { UpdateInventoryUseCase } from '../../application/use-cases/update-inventory.use-case';
import { GetLowStockUseCase } from '../../application/use-cases/get-low-stock.use-case';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

@Controller({
  path: 'inventory',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(
    private readonly createInventoryUseCase: CreateInventoryUseCase,
    private readonly getInventoryUseCase: GetInventoryUseCase,
    private readonly updateInventoryUseCase: UpdateInventoryUseCase,
    private readonly getLowStockUseCase: GetLowStockUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateInventoryDto) {
    return this.createInventoryUseCase.execute({
      variantId: dto.variantId,
      quantity: dto.quantity,
      minStock: dto.minStock,
    });
  }

  @Get('low-stock')
  @Roles('Administrator', 'Staff')
  getLowStock() {
    return this.getLowStockUseCase.execute();
  }

  @Get(':variantId')
  @Roles('Administrator', 'Staff')
  findOne(@Param('variantId') variantId: string) {
    return this.getInventoryUseCase.execute(variantId);
  }

  @Patch(':variantId')
  @Roles('Administrator', 'Staff')
  update(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.updateInventoryUseCase.execute(variantId, {
      quantity: dto.quantity,
      minStock: dto.minStock,
    });
  }
}
