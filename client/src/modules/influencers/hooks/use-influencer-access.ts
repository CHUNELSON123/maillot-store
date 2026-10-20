'use client';

import { useCallback, useEffect, useState } from 'react';
import { authStorage } from '@/lib/auth/auth-storage';
import { influencerService } from '../services/influencer.service';

export function useInfluencerAccess() {
  const [canOpenPortal, setCanOpenPortal] = useState(false);

  const refresh = useCallback(async () => {
    const token = authStorage.getToken();
    if (!token) {
      setCanOpenPortal(false);
      return;
    }
    try {
      await influencerService.getPortal();
      setCanOpenPortal(true);
    } catch {
      setCanOpenPortal(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    window.addEventListener('maillot-auth-updated', refresh);
    return () => window.removeEventListener('maillot-auth-updated', refresh);
  }, [refresh]);

  return canOpenPortal;
}
