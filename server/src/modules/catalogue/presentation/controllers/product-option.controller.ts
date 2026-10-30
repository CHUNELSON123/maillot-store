import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
  ProductOptionType,
} from '../../domain/repositories/product-option.repository';
import { CreateProductOptionUseCase } from '../../application/use-cases/create-product-option.use-case';
import { DeleteProductOptionUseCase } from '../../application/use-cases/delete-product-option.use-case';
import { GetProductOptionsUseCase } from '../../application/use-cases/get-product-options.use-case';
import { UpdateProductOptionUseCase } from '../../application/use-cases/update-product-option.use-case';

@Controller({ path: 'product-options', version: '1' })
export class ProductOptionController {
  constructor(
    private readonly createUseCase: CreateProductOptionUseCase,
    private readonly getUseCase: GetProductOptionsUseCase,
    private readonly updateUseCase: UpdateProductOptionUseCase,
    private readonly deleteUseCase: DeleteProductOptionUseCase,
  ) {}

  @Get()
  findAll(@Query('type') type?: string) {
    if (type !== undefined && type !== 'COLOR' && type !== 'EDITION') {
      throw new BadRequestException('Type must be COLOR or EDITION.');
    }
    return this.getUseCase.execute(type as ProductOptionType | undefined);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  create(@Body() body: { type: ProductOptionType; name: string }) {
    if (body.type !== 'COLOR' && body.type !== 'EDITION') {
      throw new BadRequestException('Type must be COLOR or EDITION.');
    }
    if (typeof body.name !== 'string' || !body.name.trim()) {
      throw new BadRequestException('Option name is required.');
    }
    return this.createUseCase.execute({ type: body.type, name: body.name });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  update(@Param('id') id: string, @Body() body: { name: string }) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      throw new BadRequestException('Option name is required.');
    }
    return this.updateUseCase.execute(id, { name: body.name });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  remove(@Param('id') id: string) {
    return this.deleteUseCase.execute(id);
  }
}