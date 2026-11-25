import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateInventoryMovementUseCase } from '../../application/use-cases/create-inventory-movement.use-case';
import { GetInventoryMovementsUseCase } from '../../application/use-cases/get-inventory-movements.use-case';
import { CreateInventoryMovementDto } from '../dto/create-inventory-movement.dto';
import { ImportInventoryUseCase } from '../../application/use-cases/import-inventory.use-case';
import { ImportInventoryDto } from '../dto/import-inventory.dto';
import { ListInventoryMovementsDto } from '../dto/list-inventory-movements.dto';

@Controller({
  path: 'inventory/movements',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryMovementController {
  constructor(
    private readonly createInventoryMovementUseCase: CreateInventoryMovementUseCase,
    private readonly getInventoryMovementsUseCase: GetInventoryMovementsUseCase,
    private readonly importInventoryUseCase: ImportInventoryUseCase,
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

  @Post('import')
  @Roles('Administrator', 'Staff')
  import(@Body() dto: ImportInventoryDto) {
    return this.importInventoryUseCase.execute(dto.rows);
  }

  @Get('all')
  @Roles('Administrator', 'Staff')
  findAllPage(@Query() query: ListInventoryMovementsDto) {
    return this.getInventoryMovementsUseCase.executeAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      movementType: query.movementType,
    });
  }

  @Get(':variantId')
  @Roles('Administrator', 'Staff')
  findAll(@Param('variantId') variantId: string) {
    return this.getInventoryMovementsUseCase.execute(variantId);
  }
}
