import { InfluencerEntity } from '../entities/influencer.entity';
import { InfluencerProfileData } from '../entities/influencer.entity';
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
  status?: 'REJECTED';
}

export interface CreateReferralData {
  influencerId: string;
  orderId?: string;
  referralCode: string;
  status: string;
}

export interface RegisterInfluencerData {
  userId?: string;
  email: string;
  passwordHash?: string;
  referralCode: string;
  status: string;
  commissionRate: number;
  customerDiscountRate?: number;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  dateOfBirth: Date;
  gender: string;
  city: string;
  occupation: string;
  bio: string;
  applicationNote: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  xUrl?: string;
  termsAcceptedAt: Date;
}

export type UpdateInfluencerProfileData = Partial<Pick<InfluencerProfileData,
  'email' | 'firstName' | 'lastName' | 'phone' | 'country' | 'city' | 'occupation' |
  'bio' | 'applicationNote' | 'instagramUrl' | 'tiktokUrl' | 'youtubeUrl' |
  'facebookUrl' | 'xUrl' | 'profilePictureUrl'
>>;

export abstract class InfluencerRepository {
  abstract create(data: CreateInfluencerData): Promise<InfluencerEntity>;

  abstract findById(influencerId: string): Promise<InfluencerEntity | null>;

  abstract findByUserId(userId: string): Promise<InfluencerEntity | null>;

  abstract findProfileByUserId(userId: string): Promise<InfluencerEntity | null>;

  abstract updateProfileByUserId(
    userId: string,
    data: UpdateInfluencerProfileData,
  ): Promise<InfluencerEntity>;

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

  abstract createReferralClick(
    referralCode: string,
    tokenHash: string,
  ): Promise<void>;
}
