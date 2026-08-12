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
import { CreateBrandUseCase } from '../../application/use-cases/create-brand.use-case';
import { DeleteBrandUseCase } from '../../application/use-cases/delete-brand.use-case';
import { GetBrandsUseCase } from '../../application/use-cases/get-brands.use-case';
import { GetBrandUseCase } from '../../application/use-cases/get-brand.use-case';
import { UpdateBrandUseCase } from '../../application/use-cases/update-brand.use-case';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';

@Controller({
  path: 'brands',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandController {
  constructor(
    private readonly createBrandUseCase: CreateBrandUseCase,
    private readonly getBrandsUseCase: GetBrandsUseCase,
    private readonly getBrandUseCase: GetBrandUseCase,
    private readonly updateBrandUseCase: UpdateBrandUseCase,
    private readonly deleteBrandUseCase: DeleteBrandUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateBrandDto) {
    return this.createBrandUseCase.execute({
      name: dto.name,
      description: dto.description,
    });
  }

  @Get()
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findAll() {
    return this.getBrandsUseCase.execute();
  }

  @Get(':id')
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findOne(@Param('id') id: string) {
    return this.getBrandUseCase.execute(id);
  }

  @Patch(':id')
  @Roles('Administrator', 'Staff')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.updateBrandUseCase.execute(id, {
      name: dto.name,
      description: dto.description,
    });
  }

  @Delete(':id')
  @Roles('Administrator')
  remove(@Param('id') id: string) {
    return this.deleteBrandUseCase.execute(id);
  }
}
