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
import { CreateDeliveryUseCase } from '../../application/use-cases/create-delivery.use-case';
import { GetDeliveryUseCase } from '../../application/use-cases/get-delivery.use-case';
import { UpdateDeliveryUseCase } from '../../application/use-cases/update-delivery.use-case';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';
import { UpdateDeliveryDto } from '../dto/update-delivery.dto';

@Controller({
  path: 'deliveries',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    private readonly getDeliveryUseCase: GetDeliveryUseCase,
    private readonly updateDeliveryUseCase: UpdateDeliveryUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  create(@Body() dto: CreateDeliveryDto) {
    return this.createDeliveryUseCase.execute({
      orderId: dto.orderId,
      address: dto.address,
      provider: dto.provider,
    });
  }

  @Get(':orderId')
  @Roles('Administrator', 'Staff', 'Customer')
  getDelivery(@Param('orderId') orderId: string) {
    return this.getDeliveryUseCase.execute(orderId);
  }

  @Patch(':id')
  @Roles('Administrator', 'Staff')
  update(@Param('id') deliveryId: string, @Body() dto: UpdateDeliveryDto) {
    return this.updateDeliveryUseCase.execute(deliveryId, dto);
  }
}
