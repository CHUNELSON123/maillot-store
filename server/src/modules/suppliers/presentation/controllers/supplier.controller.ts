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
import { CreateSupplierUseCase } from '../../application/use-cases/create-supplier.use-case';
import { GetSuppliersUseCase } from '../../application/use-cases/get-suppliers.use-case';
import { GetSupplierUseCase } from '../../application/use-cases/get-supplier.use-case';
import { UpdateSupplierUseCase } from '../../application/use-cases/update-supplier.use-case';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Controller({
  path: 'suppliers',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupplierController {
  constructor(
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly getSuppliersUseCase: GetSuppliersUseCase,
    private readonly getSupplierUseCase: GetSupplierUseCase,
    private readonly updateSupplierUseCase: UpdateSupplierUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateSupplierDto) {
    return this.createSupplierUseCase.execute(dto);
  }

  @Get()
  @Roles('Administrator', 'Staff')
  findAll() {
    return this.getSuppliersUseCase.execute();
  }

  @Get(':id')
  @Roles('Administrator', 'Staff')
  findOne(@Param('id') supplierId: string) {
    return this.getSupplierUseCase.execute(supplierId);
  }

  @Patch(':id')
  @Roles('Administrator', 'Staff')
  update(@Param('id') supplierId: string, @Body() dto: UpdateSupplierDto) {
    return this.updateSupplierUseCase.execute(supplierId, dto);
  }
}
