import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommissionRepository } from '../../domain/repositories/commission.repository';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';
import { OrderRepository } from '../../../orders/domain/repositories/order.repository';

export interface CreateCommissionInput {
  referralId: string;
}

@Injectable()
export class CreateCommissionUseCase {
  constructor(
    private readonly commissionRepository: CommissionRepository,
    private readonly influencerRepository: InfluencerRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: CreateCommissionInput) {
    const referral = await this.influencerRepository.findReferralById(
      input.referralId,
    );

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    if (!referral.orderId) {
      throw new BadRequestException('Referral is not linked to an order');
    }

    const influencer = await this.influencerRepository.findById(
      referral.influencerId,
    );

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (influencer.status !== 'ACTIVE') {
      throw new BadRequestException('Influencer is not active');
    }

    const order = await this.orderRepository.findById(referral.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const productSubtotal = order.items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    );

    const commissionableAmount = Math.max(
      0,
      productSubtotal - order.influencerDiscountAmount,
    );

    if (commissionableAmount <= 0) {
      throw new BadRequestException(
        'Commissionable product amount must be greater than zero',
      );
    }

    const commissionAmount =
      (commissionableAmount * influencer.commissionRate) / 100;

    if (commissionAmount <= 0) {
      throw new BadRequestException(
        'Commission amount must be greater than zero',
      );
    }

    return this.commissionRepository.create({
      influencerId: influencer.id,
      referralId: referral.id,
      amount: commissionAmount,
      status: 'PENDING',
    });
  }
}
