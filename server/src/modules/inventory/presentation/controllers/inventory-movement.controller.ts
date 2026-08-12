import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateInventoryMovementUseCase } from '../../application/use-cases/create-inventory-movement.use-case';
import { GetInventoryMovementsUseCase } from '../../application/use-cases/get-inventory-movements.use-case';
import { CreateInventoryMovementDto } from '../dto/create-inventory-movement.dto';

@Controller({
  path: 'inventory/movements',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryMovementController {
  constructor(
    private readonly createInventoryMovementUseCase: CreateInventoryMovementUseCase,
    private readonly getInventoryMovementsUseCase: GetInventoryMovementsUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateInventoryMovementDto) {
    return this.createInventoryMovementUseCase.execute({
      variantId: dto.variantId,
      quantity: dto.quantity,
      movementType: dto.movementType,
      reference: dto.reference,
    });
  }

  @Get(':variantId')
  @Roles('Administrator', 'Staff')
  findAll(@Param('variantId') variantId: string) {
    return this.getInventoryMovementsUseCase.execute(variantId);
  }
}
