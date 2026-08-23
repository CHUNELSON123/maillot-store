import { CommissionEntity } from '../entities/commission.entity';

export interface CreateCommissionData {
  influencerId: string;
  referralId?: string;
  amount: number;
  status: string;
}

export abstract class CommissionRepository {
  abstract create(data: CreateCommissionData): Promise<CommissionEntity>;

  abstract findById(commissionId: string): Promise<CommissionEntity | null>;

  abstract findByInfluencer(influencerId: string): Promise<CommissionEntity[]>;

  abstract findByReferral(referralId: string): Promise<CommissionEntity | null>;

  abstract updateStatus(
    commissionId: string,
    status: string,
  ): Promise<CommissionEntity>;
}
