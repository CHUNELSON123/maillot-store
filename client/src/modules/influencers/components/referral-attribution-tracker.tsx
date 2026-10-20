'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { influencerService, referralAttributionStorage } from '../services/influencer.service';

export function ReferralAttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryCode = searchParams.get('ref');
  useEffect(() => {
    const code = queryCode?.trim().toUpperCase();
    if (!code) return;
    const existing = referralAttributionStorage.get();
    if (existing?.referralCode === code) return;
    void influencerService.trackReferralClick(code)
      .then(({ attributionToken }) => referralAttributionStorage.set({ referralCode: code, attributionToken }))
      .catch(() => referralAttributionStorage.clear());
  }, [pathname, queryCode]);
  return null;
}
