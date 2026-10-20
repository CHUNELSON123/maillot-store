import { apiClient } from '@/services/api/api-client';
import { authStorage } from '@/lib/auth/auth-storage';
import { InfluencerApplication, InfluencerPortalData, InfluencerProfile } from '../types/influencer.types';

const token = () => authStorage.getToken() ?? undefined;

export const influencerService = {
  register(application: InfluencerApplication) {
    return apiClient('/influencers/register', {
      method: 'POST',
      token: token(),
      body: JSON.stringify(application),
    });
  },
  getPortal() {
    return apiClient<InfluencerPortalData>('/influencers/me/portal', { method: 'GET', token: token() });
  },
  updateProfile(data: Partial<InfluencerProfile['profile']> & { firstName?: string; lastName?: string }) {
    return apiClient<InfluencerProfile>('/influencers/me', {
      method: 'PATCH',
      token: token(),
      body: JSON.stringify(data),
    });
  },
  requestWithdrawal(amount: number) {
    return apiClient('/withdrawals/me', {
      method: 'POST',
      token: token(),
      body: JSON.stringify({ amount }),
    });
  },
  async uploadProfilePhoto(file: File) {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1'}/influencers/me/photo`, {
      method: 'POST',
      headers: token() ? { Authorization: `Bearer ${token()}` } : undefined,
      body: form,
    });
    if (!response.ok) throw new Error('Could not save profile photo.');
    return response.json() as Promise<InfluencerProfile>;
  },
  trackReferralClick(referralCode: string) {
    return apiClient<{ attributionToken: string }>('/influencers/referrals/click', {
      method: 'POST',
      body: JSON.stringify({ referralCode }),
    });
  },
};

export const referralAttributionStorage = {
  key: 'maillot_influencer_attribution',
  get(): { referralCode: string; attributionToken: string } | null {
    if (typeof window === 'undefined') return null;
    try {
      const value = sessionStorage.getItem(this.key);
      return value ? JSON.parse(value) as { referralCode: string; attributionToken: string } : null;
    } catch { return null; }
  },
  set(value: { referralCode: string; attributionToken: string }) {
    if (typeof window !== 'undefined') sessionStorage.setItem(this.key, JSON.stringify(value));
  },
  clear() {
    if (typeof window !== 'undefined') sessionStorage.removeItem(this.key);
  },
};
