'use client';

import { useParams } from 'next/navigation';
import { AdminDashboardPage } from '@/modules/admin/components/admin-dashboard-page';
import { AdminReportsPage } from '@/modules/admin/components/admin-reports-page';
import { AdminSectionPage } from '@/modules/admin/components/admin-section-page';
import { AdminUsersPage } from '@/modules/admin/components/admin-users-page';
import { AdminSettingsPage } from '@/modules/admin/components/admin-settings-page';
import { AdminSetupPage } from '@/modules/admin/components/admin-setup-page';
import { AdminRegisterPage } from '@/modules/admin/components/admin-register-page';
import { AdminLoginPage } from '@/modules/admin/components/admin-login-page';
import { AdminProductsPage } from '@/modules/admin/components/admin-products-page';
import { AdminSection } from '@/modules/admin/types/admin.types';
import { AdminInfluencersPage } from '@/modules/admin/components/admin-influencers-page';

const sections = new Set<AdminSection>([
  'dashboard', 'products', 'categories-brands', 'inventory', 'orders', 'customers',
  'influencers', 'payments', 'delivery', 'reports', 'cms', 'users', 'settings',
]);

export default function AdminPage() {
  const params = useParams<{ section?: string[] }>();
  const section = params.section?.[0] ?? 'dashboard';
  if (section === 'setup') return <AdminSetupPage/>;
  if (section === 'register') return <AdminRegisterPage/>;
  if (section === 'login') return <AdminLoginPage/>;
  if (!sections.has(section as AdminSection)) return <div className="border border-neutral-200 bg-white p-8 text-sm">Admin page not found.</div>;
  if (section === 'dashboard') return <AdminDashboardPage/>;
  if (section === 'products') return <AdminProductsPage/>;
  if (section === 'reports') return <AdminReportsPage/>;
  if (section === 'users') return <AdminUsersPage/>;
  if (section === 'settings') return <AdminSettingsPage/>;
  if (section === 'influencers') return <AdminInfluencersPage />;
  return <AdminSectionPage section={section as Exclude<AdminSection, 'dashboard' | 'reports'>}/>;
}
