import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CustomerRewardEntity } from '../../domain/entities/customer-reward.entity';
import { CustomerRewardRuleEntity } from '../../domain/entities/customer-reward-rule.entity';
import {
  AwardRewardData,
  CreateRewardRuleData,
  RewardRepository,
  UpdateRewardRuleData,
} from '../../domain/repositories/reward.repository';

@Injectable()
export class PrismaRewardRepository implements RewardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRule(
    data: CreateRewardRuleData,
  ): Promise<CustomerRewardRuleEntity> {
    const rule = await this.prisma.customerRewardRule.create({
      data: {
        name: data.name,
        purchase_count_threshold: data.purchaseCountThreshold,
        spending_threshold: data.spendingThreshold,
        reward_type: data.rewardType,
        reward_value: data.rewardValue,
        gift_description: data.giftDescription,
        is_active: true,
      },
    });

    return this.toRuleEntity(rule);
  }

  async findRules(): Promise<CustomerRewardRuleEntity[]> {
    const rules = await this.prisma.customerRewardRule.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return rules.map((rule) => this.toRuleEntity(rule));
  }

  async findRuleById(ruleId: string): Promise<CustomerRewardRuleEntity | null> {
    const rule = await this.prisma.customerRewardRule.findFirst({
      where: {
        id: ruleId,
        deleted_at: null,
      },
    });

    if (!rule) {
      return null;
    }

    return this.toRuleEntity(rule);
  }

  async updateRule(
    ruleId: string,
    data: UpdateRewardRuleData,
  ): Promise<CustomerRewardRuleEntity> {
    const existingRule = await this.prisma.customerRewardRule.findFirst({
      where: {
        id: ruleId,
        deleted_at: null,
      },
    });

    if (!existingRule) {
      throw new NotFoundException('Reward rule not found');
    }

    const rule = await this.prisma.customerRewardRule.update({
      where: {
        id: ruleId,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.purchaseCountThreshold !== undefined && {
          purchase_count_threshold: data.purchaseCountThreshold,
        }),
        ...(data.spendingThreshold !== undefined && {
          spending_threshold: data.spendingThreshold,
        }),
        ...(data.rewardType !== undefined && {
          reward_type: data.rewardType,
        }),
        ...(data.rewardValue !== undefined && {
          reward_value: data.rewardValue,
        }),
        ...(data.giftDescription !== undefined && {
          gift_description: data.giftDescription,
        }),
        ...(data.isActive !== undefined && {
          is_active: data.isActive,
        }),
      },
    });

    return this.toRuleEntity(rule);
  }

  async awardReward(data: AwardRewardData): Promise<CustomerRewardEntity> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: data.customerId,
        deleted_at: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const rule = await this.prisma.customerRewardRule.findFirst({
      where: {
        id: data.rewardRuleId,
        is_active: true,
        deleted_at: null,
      },
    });

    if (!rule) {
      throw new NotFoundException('Reward rule not found or inactive');
    }

    const existingReward = await this.prisma.customerReward.findFirst({
      where: {
        customer_id: data.customerId,
        reward_rule_id: data.rewardRuleId,
        deleted_at: null,
      },
    });

    if (existingReward) {
      throw new ConflictException('Customer has already received this reward');
    }

    const reward = await this.prisma.customerReward.create({
      data: {
        customer_id: data.customerId,
        reward_rule_id: data.rewardRuleId,
        reward_type: rule.reward_type,
        reward_value: rule.reward_value,
        gift_description: rule.gift_description,
        status: 'AWARDED',
      },
    });

    return this.toRewardEntity(reward);
  }

  async findCustomerRewards(
    customerId: string,
  ): Promise<CustomerRewardEntity[]> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        deleted_at: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const rewards = await this.prisma.customerReward.findMany({
      where: {
        customer_id: customerId,
        deleted_at: null,
      },
      orderBy: {
        awarded_at: 'desc',
      },
    });

    return rewards.map((reward) => this.toRewardEntity(reward));
  }

  async findRewardById(rewardId: string): Promise<CustomerRewardEntity | null> {
    const reward = await this.prisma.customerReward.findFirst({
      where: {
        id: rewardId,
        deleted_at: null,
      },
    });

    if (!reward) {
      return null;
    }

    return this.toRewardEntity(reward);
  }

  async redeemReward(
    rewardId: string,
    customerId: string,
  ): Promise<CustomerRewardEntity> {
    const reward = await this.prisma.customerReward.findFirst({
      where: {
        id: rewardId,
        customer_id: customerId,
        deleted_at: null,
      },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (reward.status === 'REDEEMED') {
      throw new ConflictException('Reward has already been redeemed');
    }

    if (reward.status !== 'AWARDED') {
      throw new ConflictException('Reward cannot be redeemed');
    }

    const updatedReward = await this.prisma.customerReward.update({
      where: {
        id: rewardId,
      },
      data: {
        status: 'REDEEMED',
        redeemed_at: new Date(),
      },
    });

    return this.toRewardEntity(updatedReward);
  }

  private toRuleEntity(rule: {
    id: string;
    name: string;
    purchase_count_threshold: number | null;
    spending_threshold: unknown;
    reward_type: string;
    reward_value: unknown;
    gift_description: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): CustomerRewardRuleEntity {
    return new CustomerRewardRuleEntity(
      rule.id,
      rule.name,
      rule.purchase_count_threshold,
      rule.spending_threshold === null ? null : Number(rule.spending_threshold),
      rule.reward_type,
      rule.reward_value === null ? null : Number(rule.reward_value),
      rule.gift_description,
      rule.is_active,
      rule.created_at,
      rule.updated_at,
    );
  }

  private toRewardEntity(reward: {
    id: string;
    customer_id: string;
    reward_rule_id: string;
    reward_type: string;
    reward_value: unknown;
    gift_description: string | null;
    status: string;
    awarded_at: Date;
    redeemed_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }): CustomerRewardEntity {
    return new CustomerRewardEntity(
      reward.id,
      reward.customer_id,
      reward.reward_rule_id,
      reward.reward_type,
      reward.reward_value === null ? null : Number(reward.reward_value),
      reward.gift_description,
      reward.status,
      reward.awarded_at,
      reward.redeemed_at,
      reward.created_at,
      reward.updated_at,
    );
  }
}
