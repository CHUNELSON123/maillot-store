import { ReactNode } from 'react';
import { InfluencerPortalProvider } from '@/modules/influencers/components/influencer-portal-context';
import { InfluencerPortalShell } from '@/modules/influencers/components/influencer-portal-shell';

export default function InfluencerPortalLayout({ children }: { children: ReactNode }) {
  return <InfluencerPortalProvider><InfluencerPortalShell>{children}</InfluencerPortalShell></InfluencerPortalProvider>;
}
