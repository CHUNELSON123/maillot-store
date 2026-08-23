import { WithdrawalRequestEntity } from '../entities/withdrawal-request.entity';

export interface CreateWithdrawalData {
  influencerId: string;
  amount: number;
  status: string;
}

export interface UpdateWithdrawalData {
  status: string;
  paymentReference?: string;
  processedAt?: Date;
}

export abstract class WithdrawalRepository {
  abstract create(data: CreateWithdrawalData): Promise<WithdrawalRequestEntity>;

  abstract findById(
    withdrawalId: string,
  ): Promise<WithdrawalRequestEntity | null>;

  abstract findByInfluencer(
    influencerId: string,
  ): Promise<WithdrawalRequestEntity[]>;

  abstract updateStatus(
    withdrawalId: string,
    data: UpdateWithdrawalData,
  ): Promise<WithdrawalRequestEntity>;
}
