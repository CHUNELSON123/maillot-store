'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { authStorage } from '@/lib/auth/auth-storage';
import { apiClient } from '@/services/api/api-client';
import { influencerService } from '../services/influencer.service';
import { InfluencerPortalData } from '../types/influencer.types';

type PortalContextValue = { data: InfluencerPortalData | null; loading: boolean; error: string; refresh: () => Promise<void> };
const Context = createContext<PortalContextValue | null>(null);

export function InfluencerPortalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [data, setData] = useState<InfluencerPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    const accessToken = authStorage.getToken();
    if (!accessToken) {
      window.location.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await apiClient<{ roleName?: string }>('/auth/me', { method: 'GET', token: accessToken });
      if (user.roleName !== 'Influencer' && user.roleName !== 'Customer') {
        setError('This portal is only available to influencer accounts.');
        return;
      }
      const portal = await influencerService.getPortal();
      setData(portal);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not load your influencer account.');
    } finally { setLoading(false); }
  }, [pathname]);

  useEffect(() => { void refresh(); }, [refresh]);
  return <Context.Provider value={{ data, loading, error, refresh }}>{children}</Context.Provider>;
}

export function useInfluencerPortal() {
  const value = useContext(Context);
  if (!value) throw new Error('useInfluencerPortal must be used inside InfluencerPortalProvider');
  return value;
}
