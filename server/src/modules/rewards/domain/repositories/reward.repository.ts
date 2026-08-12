import { CustomerRewardEntity } from '../entities/customer-reward.entity';
import { CustomerRewardRuleEntity } from '../entities/customer-reward-rule.entity';

export interface CreateRewardRuleData {
  name: string;
  purchaseCountThreshold?: number;
  spendingThreshold?: number;
  rewardType: string;
  rewardValue?: number;
  giftDescription?: string;
}

export interface UpdateRewardRuleData {
  name?: string;
  purchaseCountThreshold?: number;
  spendingThreshold?: number;
  rewardType?: string;
  rewardValue?: number;
  giftDescription?: string;
  isActive?: boolean;
}

export interface AwardRewardData {
  customerId: string;
  rewardRuleId: string;
}

export abstract class RewardRepository {
  abstract createRule(
    data: CreateRewardRuleData,
  ): Promise<CustomerRewardRuleEntity>;

  abstract findRules(): Promise<CustomerRewardRuleEntity[]>;

  abstract findRuleById(
    ruleId: string,
  ): Promise<CustomerRewardRuleEntity | null>;

  abstract updateRule(
    ruleId: string,
    data: UpdateRewardRuleData,
  ): Promise<CustomerRewardRuleEntity>;

  abstract awardReward(data: AwardRewardData): Promise<CustomerRewardEntity>;

  abstract findCustomerRewards(
    customerId: string,
  ): Promise<CustomerRewardEntity[]>;

  abstract findRewardById(
    rewardId: string,
  ): Promise<CustomerRewardEntity | null>;

  abstract redeemReward(
    rewardId: string,
    customerId: string,
  ): Promise<CustomerRewardEntity>;
}
