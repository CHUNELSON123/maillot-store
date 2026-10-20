export type InfluencerProfile = {
  id: string;
  userId: string;
  referralCode: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | string;
  commissionRate: number;
  customerDiscountRate: number;
  profile: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    country?: string | null;
    dateOfBirth?: string | null;
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
    termsAcceptedAt?: string | null;
  };
};

export type InfluencerReferral = {
  id: string;
  orderId: string | null;
  referralCode: string;
  status: string;
  createdAt: string;
  orderNumber: string | null;
  orderStatus: string | null;
  saleAmount: number | null;
  customerLabel: string | null;
  productNames: string[];
};

export type InfluencerCommission = {
  id: string;
  amount: number;
  status: string;
  commissionRateSnapshot: number | null;
  createdAt: string;
  updatedAt: string;
};

export type InfluencerWithdrawal = {
  id: string;
  amount: number;
  status: string;
  paymentReference: string | null;
  processedAt: string | null;
  createdAt: string;
};

export type InfluencerPortalData = {
  profile: InfluencerProfile;
  referrals: InfluencerReferral[];
  commissions: InfluencerCommission[];
  withdrawals: InfluencerWithdrawal[];
  metrics: {
    clicks: number;
    orders: number;
    sales: number;
    totalEarnings: number;
    pendingEarnings: number;
    availableBalance: number;
    totalWithdrawn: number;
  };
  activity: { date: string; clicks: number; orders: number; sales: number }[];
};

export type InfluencerApplication = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  dateOfBirth: string;
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
  termsAccepted: boolean;
};
