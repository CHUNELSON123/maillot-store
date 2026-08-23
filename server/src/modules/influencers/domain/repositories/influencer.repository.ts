import { InfluencerEntity } from '../entities/influencer.entity';
import { ReferralEntity } from '../entities/referral.entity';

export interface CreateInfluencerData {
  userId: string;
  referralCode: string;
  status: string;
  commissionRate: number;
  customerDiscountRate?: number;
}

export interface UpdateInfluencerData {
  commissionRate?: number;
  customerDiscountRate?: number;
  referralCode?: string;
}

export interface CreateReferralData {
  influencerId: string;
  orderId?: string;
  referralCode: string;
  status: string;
}

export interface RegisterInfluencerData {
  email: string;
  passwordHash: string;
  referralCode: string;
  status: string;
  commissionRate: number;
  customerDiscountRate?: number;
}

export abstract class InfluencerRepository {
  abstract create(data: CreateInfluencerData): Promise<InfluencerEntity>;

  abstract findById(influencerId: string): Promise<InfluencerEntity | null>;

  abstract findByUserId(userId: string): Promise<InfluencerEntity | null>;

  abstract findByReferralCode(
    referralCode: string,
  ): Promise<InfluencerEntity | null>;

  abstract findAll(): Promise<InfluencerEntity[]>;

  abstract update(
    influencerId: string,
    data: UpdateInfluencerData,
  ): Promise<InfluencerEntity>;

  abstract approve(influencerId: string): Promise<InfluencerEntity>;

  abstract createReferral(data: CreateReferralData): Promise<ReferralEntity>;

  abstract findReferralsByInfluencer(
    influencerId: string,
  ): Promise<ReferralEntity[]>;

  abstract findReferralByCode(
    referralCode: string,
  ): Promise<ReferralEntity | null>;

  abstract findReferralById(referralId: string): Promise<ReferralEntity | null>;

  abstract register(data: RegisterInfluencerData): Promise<InfluencerEntity>;

  abstract referralCodeExists(referralCode: string): Promise<boolean>;
}
