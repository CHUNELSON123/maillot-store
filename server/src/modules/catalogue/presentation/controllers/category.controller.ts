import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { GetCategoryUseCase } from '../../application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Controller({
  path: 'categories',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateCategoryDto) {
    return this.createCategoryUseCase.execute({
      name: dto.name,
      description: dto.description,
    });
  }

  @Get()
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findAll() {
    return this.getCategoriesUseCase.execute();
  }

  @Get(':id')
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findOne(@Param('id') id: string) {
    return this.getCategoryUseCase.execute(id);
  }

  @Patch(':id')
  @Roles('Administrator', 'Staff')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.updateCategoryUseCase.execute(id, {
      name: dto.name,
      description: dto.description,
    });
  }

  @Delete(':id')
  @Roles('Administrator')
  remove(@Param('id') id: string) {
    return this.deleteCategoryUseCase.execute(id);
  }
}
