export class InfluencerEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly referralCode: string,
    public readonly status: string,
    public readonly commissionRate: number,
    public readonly customerDiscountRate: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly profile: InfluencerProfileData = {},
  ) {}
}

export interface InfluencerProfileData {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  country?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  city?: string | null;
  occupation?: string | null;
  bio?: string | null;
  applicationNote?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
  xUrl?: string | null;
  profilePictureUrl?: string | null;
  termsAcceptedAt?: Date | null;
  createdAt?: Date;
}
